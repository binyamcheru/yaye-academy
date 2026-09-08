"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import {
  announcementSchema,
  liveSessionSchema,
} from "@/modules/communication/schemas";
import {
  CommunicationError,
  createAnnouncement,
  createLiveSession,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/modules/communication/service";

export type CommunicationActionState = Readonly<{
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
}>;

function communicationError(error: unknown) {
  return error instanceof CommunicationError
    ? error.message
    : "The update could not be published. Please try again.";
}

export async function createLiveSessionAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const session = await requireRole("INSTRUCTOR");
  const result = liveSessionSchema.safeParse({
    programId: formData.get("programId"),
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    meetingUrl: formData.get("meetingUrl"),
    recordingUrl: formData.get("recordingUrl"),
    slidesUrl: formData.get("slidesUrl"),
    resourceUrl: formData.get("resourceUrl"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  try {
    await createLiveSession(session.user.id, result.data);
  } catch (error) {
    return { status: "error", message: communicationError(error) };
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/instructor/programs/${result.data.programId}/sessions`);
  redirect(
    `/instructor/programs/${result.data.programId}/sessions?created=session`,
  );
}

export async function createAnnouncementAction(
  _previousState: CommunicationActionState,
  formData: FormData,
): Promise<CommunicationActionState> {
  const session = await requireRole("INSTRUCTOR");
  const result = announcementSchema.safeParse({
    programId: formData.get("programId"),
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  try {
    await createAnnouncement(session.user.id, result.data);
  } catch (error) {
    return { status: "error", message: communicationError(error) };
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/instructor/programs/${result.data.programId}/announcements`);
  redirect(
    `/instructor/programs/${result.data.programId}/announcements?created=announcement`,
  );
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireRole("LEARNER");
  const id = z.string().min(1).parse(formData.get("notificationId"));
  await markNotificationRead(session.user.id, id);
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await requireRole("LEARNER");
  await markAllNotificationsRead(session.user.id);
  revalidatePath("/dashboard", "layout");
}
