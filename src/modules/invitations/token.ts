import { createHash, randomBytes } from "node:crypto";

export const invitationTokenBytes = 32;
export const invitationLifetimeDays = 7;

export function normalizeInvitationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateInvitationToken() {
  return randomBytes(invitationTokenBytes).toString("base64url");
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function invitationExpiresAt(
  now = new Date(),
  lifetimeDays = invitationLifetimeDays,
) {
  return new Date(now.getTime() + lifetimeDays * 24 * 60 * 60 * 1000);
}

export type InvitationStateInput = Readonly<{
  acceptedAt: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date;
}>;

export type InvitationState = "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED";

export function invitationState(
  invitation: InvitationStateInput,
  now = new Date(),
): InvitationState {
  if (invitation.cancelledAt) return "CANCELLED";
  if (invitation.acceptedAt) return "ACCEPTED";
  if (invitation.expiresAt.getTime() <= now.getTime()) return "EXPIRED";
  return "PENDING";
}
