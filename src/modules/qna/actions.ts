"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import {
  acceptAnswerSchema,
  answerSchema,
  questionSchema,
} from "@/modules/qna/schemas";
import {
  acceptAnswer,
  createInstructorAnswer,
  createLearnerAnswer,
  createQuestion,
  QnaError,
} from "@/modules/qna/service";

export type QnaActionState = Readonly<{
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
}>;

function qnaMessage(error: unknown) {
  return error instanceof QnaError
    ? error.message
    : "The Q&A update could not be saved. Please try again.";
}

export async function createQuestionAction(
  _previousState: QnaActionState,
  formData: FormData,
): Promise<QnaActionState> {
  const session = await requireRole("LEARNER");
  const result = questionSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  let question;
  try {
    question = await createQuestion(session.user.id, result.data);
  } catch (error) {
    return { status: "error", message: qnaMessage(error) };
  }
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/questions/${question.id}`);
}

async function answerAction(
  role: "LEARNER" | "INSTRUCTOR",
  previousState: QnaActionState,
  formData: FormData,
): Promise<QnaActionState> {
  void previousState;
  const session = await requireRole(role);
  const result = answerSchema.safeParse({
    questionId: formData.get("questionId"),
    body: formData.get("body"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  try {
    if (role === "LEARNER") {
      await createLearnerAnswer(session.user.id, result.data);
      revalidatePath(`/dashboard/questions/${result.data.questionId}`);
    } else {
      await createInstructorAnswer(session.user.id, result.data);
      revalidatePath("/instructor/questions");
    }
    revalidatePath("/dashboard", "layout");
    return { status: "success", message: "Answer published." };
  } catch (error) {
    return { status: "error", message: qnaMessage(error) };
  }
}

export async function createLearnerAnswerAction(
  previousState: QnaActionState,
  formData: FormData,
) {
  return answerAction("LEARNER", previousState, formData);
}

export async function createInstructorAnswerAction(
  previousState: QnaActionState,
  formData: FormData,
) {
  return answerAction("INSTRUCTOR", previousState, formData);
}

export async function acceptAnswerAction(formData: FormData) {
  const session = await requireRole("INSTRUCTOR");
  const result = acceptAnswerSchema.safeParse({
    questionId: formData.get("questionId"),
    answerId: formData.get("answerId"),
  });
  if (!result.success) throw new QnaError("Invalid accepted-answer request.");
  await acceptAnswer(
    session.user.id,
    result.data.questionId,
    result.data.answerId,
  );
  revalidatePath("/instructor/questions");
  revalidatePath(`/dashboard/questions/${result.data.questionId}`);
  revalidatePath("/dashboard", "layout");
}
