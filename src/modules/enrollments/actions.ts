"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import {
  enrollInFreeProgram,
  EnrollmentError,
  setLessonCompletion,
} from "@/modules/enrollments/service";

export type LearningActionState = Readonly<{
  status?: "success" | "error";
  message?: string;
}>;

export async function freeEnrollmentAction(
  _previousState: LearningActionState,
  formData: FormData,
): Promise<LearningActionState> {
  const session = await requireRole("LEARNER");
  const programId = z.string().min(1).safeParse(formData.get("programId"));
  if (!programId.success) {
    return { status: "error", message: "Program not found." };
  }

  try {
    await enrollInFreeProgram(session.user.id, programId.data);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof EnrollmentError
          ? error.message
          : "Enrollment could not be completed.",
    };
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/programs/${programId.data}`);
}

export async function lessonCompletionAction(
  _previousState: LearningActionState,
  formData: FormData,
): Promise<LearningActionState> {
  const session = await requireRole("LEARNER");
  const lessonId = z.string().min(1).safeParse(formData.get("lessonId"));
  const programId = z.string().min(1).safeParse(formData.get("programId"));
  const complete = z
    .enum(["true", "false"])
    .safeParse(formData.get("complete"));
  if (!lessonId.success || !programId.success || !complete.success) {
    return { status: "error", message: "Invalid lesson progress request." };
  }

  try {
    const progress = await setLessonCompletion(
      session.user.id,
      lessonId.data,
      complete.data === "true",
    );
    revalidatePath("/dashboard", "layout");
    return {
      status: "success",
      message:
        complete.data === "true"
          ? `Lesson complete · ${progress.percentage}% program progress`
          : "Lesson returned to incomplete.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof EnrollmentError
          ? error.message
          : "Progress could not be updated.",
    };
  }
}
