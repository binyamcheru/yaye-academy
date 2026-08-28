"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { env } from "@/lib/env";
import { requireRole } from "@/modules/auth/session";
import { invitationSchema } from "@/modules/invitations/schemas";
import {
  acceptPrivateInvitation,
  cancelPrivateInvitation,
  createPrivateInvitation,
  InvitationError,
} from "@/modules/invitations/service";

export type InvitationActionState = Readonly<{
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  previewUrl?: string;
}>;

export async function createInvitationAction(
  _previousState: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const session = await requireRole("ADMIN");
  const result = invitationSchema.safeParse({
    cohortId: formData.get("cohortId"),
    email: formData.get("email"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  try {
    const { token } = await createPrivateInvitation(
      result.data,
      session.user.id,
    );
    revalidatePath("/admin/enrollments");
    return {
      status: "success",
      message:
        "Invitation created. Copy this development link now; the raw token is not stored and will not be shown again.",
      previewUrl: `${env.NEXT_PUBLIC_APP_URL}/invitations/${token}`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof InvitationError
          ? error.message
          : "The invitation could not be created.",
    };
  }
}

export async function cancelInvitationAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = z.string().min(1).parse(formData.get("invitationId"));
  await cancelPrivateInvitation(id);
  revalidatePath("/admin/enrollments");
}

export async function acceptInvitationAction(formData: FormData) {
  const session = await requireRole("LEARNER");
  const token = z.string().min(20).safeParse(formData.get("token"));
  if (!token.success) redirect("/invitations/invalid");

  let programId: string;
  try {
    const result = await acceptPrivateInvitation(token.data, session.user);
    programId = result.programId;
  } catch (error) {
    const message =
      error instanceof InvitationError
        ? error.message
        : "Invitation acceptance could not be completed.";
    redirect(`/invitations/${token.data}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/programs/${programId}`);
}
