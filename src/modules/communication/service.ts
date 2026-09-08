import "server-only";

import { EnrollmentStatus, NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

import type {
  announcementSchema,
  liveSessionSchema,
} from "@/modules/communication/schemas";
import type { z } from "zod";

export class CommunicationError extends Error {}

type LiveSessionInput = z.infer<typeof liveSessionSchema>;
type AnnouncementInput = z.infer<typeof announcementSchema>;

const eligibleEnrollmentStatuses = [
  EnrollmentStatus.ACTIVE,
  EnrollmentStatus.COMPLETED,
] as const;

const assignedCohortWhere = (
  instructorId: string,
  cohortId: string,
  programId: string,
) => ({ id: cohortId, programId, instructorId });

export function listInstructorPrograms(instructorId: string) {
  return prisma.cohort.findMany({
    where: { instructorId },
    include: {
      program: { select: { id: true, title: true, shortDescription: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ startDate: "asc" }, { name: "asc" }],
  });
}

export function listUpcomingInstructorSessions(instructorId: string) {
  return prisma.liveSession.findMany({
    where: { cohort: { instructorId }, startsAt: { gte: new Date() } },
    include: {
      cohort: {
        select: {
          name: true,
          program: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
  });
}

export async function getInstructorProgram(
  instructorId: string,
  programId: string,
) {
  const cohorts = await prisma.cohort.findMany({
    where: { instructorId, programId },
    include: {
      program: { select: { id: true, title: true, shortDescription: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "asc" },
  });
  if (!cohorts.length) return null;
  return { program: cohorts[0]!.program, cohorts };
}

export function listInstructorSessions(
  instructorId: string,
  programId: string,
) {
  return prisma.liveSession.findMany({
    where: { cohort: { instructorId, programId } },
    include: {
      cohort: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
  });
}

export function listInstructorAnnouncements(
  instructorId: string,
  programId: string,
) {
  return prisma.announcement.findMany({
    where: { cohort: { instructorId, programId } },
    include: {
      cohort: { select: { id: true, name: true } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function notificationRecipients(
  transaction: Prisma.TransactionClient,
  cohortId: string,
) {
  const enrollments = await transaction.enrollment.findMany({
    where: { cohortId, status: { in: [...eligibleEnrollmentStatuses] } },
    select: { userId: true },
  });
  return enrollments.map(({ userId }) => userId);
}

export async function createLiveSession(
  instructorId: string,
  input: LiveSessionInput,
) {
  return prisma.$transaction(async (transaction) => {
    const cohort = await transaction.cohort.findFirst({
      where: assignedCohortWhere(instructorId, input.cohortId, input.programId),
      include: { program: { select: { title: true } } },
    });
    if (!cohort) {
      throw new CommunicationError(
        "You can only schedule sessions for batches assigned to you.",
      );
    }

    const session = await transaction.liveSession.create({
      data: {
        cohortId: cohort.id,
        createdById: instructorId,
        title: input.title,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        meetingUrl: input.meetingUrl,
        recordingUrl: input.recordingUrl,
        slidesUrl: input.slidesUrl,
        resourceUrl: input.resourceUrl,
      },
    });
    const recipients = await notificationRecipients(transaction, cohort.id);
    if (recipients.length) {
      await transaction.notification.createMany({
        data: recipients.map((userId) => ({
          userId,
          type: NotificationType.LIVE_SESSION_CREATED,
          title: `New live session: ${session.title}`,
          body: `${cohort.program.title} · ${cohort.name}`,
          href: `/dashboard/programs/${input.programId}/sessions`,
        })),
      });
    }
    return session;
  });
}

export async function createAnnouncement(
  instructorId: string,
  input: AnnouncementInput,
) {
  return prisma.$transaction(async (transaction) => {
    const cohort = await transaction.cohort.findFirst({
      where: assignedCohortWhere(instructorId, input.cohortId, input.programId),
      include: { program: { select: { title: true } } },
    });
    if (!cohort) {
      throw new CommunicationError(
        "You can only publish announcements for batches assigned to you.",
      );
    }

    const announcement = await transaction.announcement.create({
      data: {
        cohortId: cohort.id,
        authorId: instructorId,
        title: input.title,
        body: input.body,
      },
    });
    const recipients = await notificationRecipients(transaction, cohort.id);
    if (recipients.length) {
      await transaction.notification.createMany({
        data: recipients.map((userId) => ({
          userId,
          type: NotificationType.ANNOUNCEMENT_PUBLISHED,
          title: `New announcement: ${announcement.title}`,
          body: `${cohort.program.title} · ${cohort.name}`,
          href: `/dashboard/programs/${input.programId}`,
        })),
      });
    }
    return announcement;
  });
}

async function getEligibleEnrollment(userId: string, programId: string) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: [...eligibleEnrollmentStatuses] },
      cohort: { programId },
    },
    include: {
      cohort: { include: { program: { select: { id: true, title: true } } } },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function getLearnerSessions(userId: string, programId: string) {
  const enrollment = await getEligibleEnrollment(userId, programId);
  if (!enrollment) return null;
  const sessions = await prisma.liveSession.findMany({
    where: { cohortId: enrollment.cohortId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
  });
  return { enrollment, sessions };
}

export async function getLearnerAnnouncements(
  userId: string,
  programId: string,
) {
  const enrollment = await getEligibleEnrollment(userId, programId);
  if (!enrollment) return null;
  const announcements = await prisma.announcement.findMany({
    where: { cohortId: enrollment.cohortId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { enrollment, announcements };
}

export async function getLearnerCommunicationSummary(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: { in: [...eligibleEnrollmentStatuses] } },
    select: { cohortId: true, cohort: { select: { programId: true } } },
  });
  const cohortIds = enrollments.map(({ cohortId }) => cohortId);
  const programByCohort = new Map(
    enrollments.map(({ cohortId, cohort }) => [cohortId, cohort.programId]),
  );
  if (!cohortIds.length) {
    return { upcomingSessions: [], recentAnnouncements: [], unreadCount: 0 };
  }
  const [upcomingSessions, recentAnnouncements, unreadCount] =
    await Promise.all([
      prisma.liveSession.findMany({
        where: { cohortId: { in: cohortIds }, startsAt: { gte: new Date() } },
        include: {
          cohort: {
            select: { name: true, program: { select: { title: true } } },
          },
        },
        orderBy: { startsAt: "asc" },
        take: 3,
      }),
      prisma.announcement.findMany({
        where: { cohortId: { in: cohortIds } },
        include: {
          cohort: {
            select: { name: true, program: { select: { title: true } } },
          },
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
  return {
    upcomingSessions: upcomingSessions.map((session) => ({
      ...session,
      programId: programByCohort.get(session.cohortId)!,
    })),
    recentAnnouncements,
    unreadCount,
  };
}

export function listLearnerNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
