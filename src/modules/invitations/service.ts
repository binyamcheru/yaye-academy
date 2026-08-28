import "server-only";

import {
  CohortStatus,
  EnrollmentStatus,
  Prisma,
  ProgramAccessType,
  ProgramStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiresAt,
  invitationState,
  normalizeInvitationEmail,
} from "@/modules/invitations/token";

export class InvitationError extends Error {}

const invitationInclude = {
  cohort: {
    include: {
      program: { select: { id: true, title: true, accessType: true } },
      instructor: { select: { name: true } },
    },
  },
  invitedBy: { select: { name: true } },
  acceptedBy: { select: { name: true, email: true } },
} as const;

export function listPrivateCohortOptions() {
  return prisma.cohort.findMany({
    where: {
      program: {
        accessType: ProgramAccessType.PRIVATE,
        status: ProgramStatus.PUBLISHED,
      },
      status: { in: [CohortStatus.UPCOMING, CohortStatus.ACTIVE] },
    },
    select: {
      id: true,
      name: true,
      program: { select: { title: true } },
    },
    orderBy: [{ program: { title: "asc" } }, { startDate: "asc" }],
  });
}

export async function listPrivateInvitations() {
  const invitations = await prisma.privateInvitation.findMany({
    include: invitationInclude,
    orderBy: { createdAt: "desc" },
  });
  return invitations.map((invitation) => ({
    ...invitation,
    state: invitationState(invitation),
  }));
}

export async function createPrivateInvitation(
  input: Readonly<{ cohortId: string; email: string }>,
  invitedById: string,
) {
  const cohort = await prisma.cohort.findFirst({
    where: {
      id: input.cohortId,
      status: { in: [CohortStatus.UPCOMING, CohortStatus.ACTIVE] },
      program: {
        accessType: ProgramAccessType.PRIVATE,
        status: ProgramStatus.PUBLISHED,
      },
    },
    select: { id: true },
  });
  if (!cohort) {
    throw new InvitationError("Choose an available private-program batch.");
  }

  const email = normalizeInvitationEmail(input.email);
  const token = generateInvitationToken();
  const invitation = await prisma.privateInvitation.create({
    data: {
      cohortId: cohort.id,
      email,
      tokenHash: hashInvitationToken(token),
      expiresAt: invitationExpiresAt(),
      invitedById,
    },
  });
  return { invitation, token };
}

export async function getInvitationPreview(token: string) {
  if (!token) return null;
  const invitation = await prisma.privateInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    include: invitationInclude,
  });
  if (!invitation) return null;
  return { ...invitation, state: invitationState(invitation) };
}

export async function cancelPrivateInvitation(id: string) {
  const invitation = await prisma.privateInvitation.findUnique({
    where: { id },
    select: { acceptedAt: true, cancelledAt: true },
  });
  if (!invitation) throw new InvitationError("Invitation not found.");
  if (invitation.acceptedAt) {
    throw new InvitationError("An accepted invitation cannot be cancelled.");
  }
  if (invitation.cancelledAt) return invitation;
  return prisma.privateInvitation.update({
    where: { id },
    data: { cancelledAt: new Date() },
  });
}

export async function acceptPrivateInvitation(
  token: string,
  user: Readonly<{ id: string; email: string; role: string }>,
) {
  if (user.role !== UserRole.LEARNER) {
    throw new InvitationError("Only learner accounts can accept invitations.");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const invitation = await transaction.privateInvitation.findUnique({
            where: { tokenHash: hashInvitationToken(token) },
            include: {
              cohort: {
                include: {
                  program: {
                    select: { id: true, accessType: true, status: true },
                  },
                },
              },
            },
          });
          if (!invitation) throw new InvitationError("Invitation not found.");
          const state = invitationState(invitation);
          if (state === "ACCEPTED") {
            throw new InvitationError("This invitation has already been used.");
          }
          if (state === "CANCELLED") {
            throw new InvitationError("This invitation was cancelled.");
          }
          if (state === "EXPIRED") {
            throw new InvitationError("This invitation has expired.");
          }
          if (normalizeInvitationEmail(user.email) !== invitation.email) {
            throw new InvitationError(
              `This invitation is intended for ${invitation.email}. Sign in with that learner account.`,
            );
          }
          if (
            invitation.cohort.program.accessType !== ProgramAccessType.PRIVATE
          ) {
            throw new InvitationError(
              "This invitation is not for a private program.",
            );
          }
          if (invitation.cohort.program.status !== ProgramStatus.PUBLISHED) {
            throw new InvitationError("This private program is not published.");
          }
          if (
            invitation.cohort.status !== CohortStatus.UPCOMING &&
            invitation.cohort.status !== CohortStatus.ACTIVE
          ) {
            throw new InvitationError(
              "This batch is no longer accepting learners.",
            );
          }

          const existing = await transaction.enrollment.findUnique({
            where: {
              userId_cohortId: {
                userId: user.id,
                cohortId: invitation.cohortId,
              },
            },
          });
          if (
            (!existing || existing.status === EnrollmentStatus.CANCELLED) &&
            invitation.cohort.capacity
          ) {
            const occupied = await transaction.enrollment.count({
              where: {
                cohortId: invitation.cohortId,
                status: { not: EnrollmentStatus.CANCELLED },
              },
            });
            if (occupied >= invitation.cohort.capacity) {
              throw new InvitationError(
                "This batch has reached its learner capacity.",
              );
            }
          }

          const enrollment = existing
            ? await transaction.enrollment.update({
                where: { id: existing.id },
                data:
                  existing.status === EnrollmentStatus.CANCELLED
                    ? {
                        status: EnrollmentStatus.ACTIVE,
                        completedAt: null,
                        enrolledAt: new Date(),
                      }
                    : {},
              })
            : await transaction.enrollment.create({
                data: { userId: user.id, cohortId: invitation.cohortId },
              });

          const consumed = await transaction.privateInvitation.updateMany({
            where: {
              id: invitation.id,
              acceptedAt: null,
              cancelledAt: null,
              expiresAt: { gt: new Date() },
            },
            data: { acceptedAt: new Date(), acceptedById: user.id },
          });
          if (consumed.count !== 1) {
            throw new InvitationError(
              "This invitation is no longer available.",
            );
          }
          return { enrollment, programId: invitation.cohort.program.id };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }
  throw new InvitationError("Invitation acceptance could not be completed.");
}
