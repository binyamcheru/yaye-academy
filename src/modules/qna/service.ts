import "server-only";

import {
  EnrollmentStatus,
  NotificationType,
  Prisma,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  AnswerAcceptanceError,
  selectAcceptedAnswer,
} from "@/modules/qna/acceptance";

export class QnaError extends Error {}

const eligibleEnrollmentStatuses = [
  EnrollmentStatus.ACTIVE,
  EnrollmentStatus.COMPLETED,
] as const;

const questionInclude = {
  author: { select: { id: true, name: true, role: true } },
  lesson: {
    select: {
      id: true,
      title: true,
      module: { select: { program: { select: { id: true, title: true } } } },
    },
  },
  cohort: { select: { id: true, name: true, instructorId: true } },
  answers: {
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.QuestionInclude;

async function findLearnerLessonAccess(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, isPublished: true },
    select: {
      id: true,
      title: true,
      module: { select: { programId: true } },
    },
  });
  if (!lesson) return null;
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: [...eligibleEnrollmentStatuses] },
      cohort: { programId: lesson.module.programId },
    },
    orderBy: { enrolledAt: "desc" },
  });
  return enrollment ? { lesson, enrollment } : null;
}

export async function createQuestion(
  userId: string,
  input: Readonly<{ lessonId: string; title: string; body: string }>,
) {
  return prisma.$transaction(async (transaction) => {
    const lesson = await transaction.lesson.findFirst({
      where: { id: input.lessonId, isPublished: true },
      select: { id: true, module: { select: { programId: true } } },
    });
    const enrollment = lesson
      ? await transaction.enrollment.findFirst({
          where: {
            userId,
            status: { in: [...eligibleEnrollmentStatuses] },
            cohort: { programId: lesson.module.programId },
          },
          orderBy: { enrolledAt: "desc" },
        })
      : null;
    if (!lesson || !enrollment) {
      throw new QnaError(
        "You must be enrolled in this lesson's batch to ask a question.",
      );
    }
    return transaction.question.create({
      data: {
        lessonId: lesson.id,
        cohortId: enrollment.cohortId,
        authorId: userId,
        title: input.title,
        body: input.body,
      },
    });
  });
}

export async function listLessonQuestionsForLearner(
  userId: string,
  lessonId: string,
) {
  const access = await findLearnerLessonAccess(userId, lessonId);
  if (!access) return null;
  const questions = await prisma.question.findMany({
    where: { lessonId, cohortId: access.enrollment.cohortId },
    include: {
      author: { select: { name: true } },
      answers: {
        select: { id: true, isAccepted: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return { access, questions };
}

export async function getLearnerQuestion(userId: string, questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: questionInclude,
  });
  if (!question) return null;
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      cohortId: question.cohortId,
      status: { in: [...eligibleEnrollmentStatuses] },
    },
  });
  return enrollment ? question : null;
}

async function createAnswerWithNotification(
  transaction: Prisma.TransactionClient,
  questionId: string,
  authorId: string,
  body: string,
) {
  const question = await transaction.question.findUnique({
    where: { id: questionId },
    include: {
      cohort: { select: { id: true, instructorId: true } },
      lesson: {
        select: { module: { select: { programId: true } } },
      },
    },
  });
  if (!question) throw new QnaError("Question not found.");

  const author = await transaction.user.findUnique({
    where: { id: authorId },
    select: { id: true, name: true, role: true },
  });
  if (!author) throw new QnaError("Account not found.");
  if (author.role === UserRole.LEARNER) {
    const enrollment = await transaction.enrollment.findFirst({
      where: {
        userId: authorId,
        cohortId: question.cohortId,
        status: { in: [...eligibleEnrollmentStatuses] },
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new QnaError(
        "You must be enrolled in this question's batch to answer.",
      );
    }
  } else if (
    author.role !== UserRole.INSTRUCTOR ||
    question.cohort.instructorId !== authorId
  ) {
    throw new QnaError(
      "Only an assigned instructor or enrolled learner can answer.",
    );
  }

  const answer = await transaction.answer.create({
    data: { questionId, authorId, body },
  });
  if (question.authorId !== authorId) {
    await transaction.notification.create({
      data: {
        userId: question.authorId,
        type: NotificationType.QUESTION_ANSWERED,
        title: "Your lesson question has a new answer",
        body: `${author.name} responded to your question.`,
        href: `/dashboard/questions/${question.id}`,
      },
    });
  }
  return { answer, programId: question.lesson.module.programId };
}

export function createLearnerAnswer(
  userId: string,
  input: Readonly<{ questionId: string; body: string }>,
) {
  return prisma.$transaction((transaction) =>
    createAnswerWithNotification(
      transaction,
      input.questionId,
      userId,
      input.body,
    ),
  );
}

export function createInstructorAnswer(
  instructorId: string,
  input: Readonly<{ questionId: string; body: string }>,
) {
  return prisma.$transaction((transaction) =>
    createAnswerWithNotification(
      transaction,
      input.questionId,
      instructorId,
      input.body,
    ),
  );
}

export function listInstructorQuestions(instructorId: string) {
  return prisma.question.findMany({
    where: { cohort: { instructorId } },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function acceptAnswer(
  instructorId: string,
  questionId: string,
  answerId: string,
) {
  return prisma.$transaction(async (transaction) => {
    const question = await transaction.question.findFirst({
      where: { id: questionId, cohort: { instructorId } },
      include: {
        answers: { select: { id: true, authorId: true, isAccepted: true } },
        lesson: {
          select: { module: { select: { programId: true } } },
        },
      },
    });
    if (!question) {
      throw new QnaError(
        "Only the assigned instructor can accept an answer for this question.",
      );
    }
    let selectedState;
    try {
      selectedState = selectAcceptedAnswer(
        question.answers.map(({ id }) => id),
        answerId,
      );
    } catch (error) {
      if (error instanceof AnswerAcceptanceError) {
        throw new QnaError(error.message);
      }
      throw error;
    }
    const selected = question.answers.find((answer) => answer.id === answerId)!;
    if (selected.isAccepted) {
      return { questionId, changed: false };
    }

    await transaction.answer.updateMany({
      where: { questionId, isAccepted: true },
      data: { isAccepted: false },
    });
    const acceptedId = selectedState.find((answer) => answer.isAccepted)!.id;
    await transaction.answer.update({
      where: { id: acceptedId },
      data: { isAccepted: true },
    });

    const recipients = [
      ...new Set([question.authorId, selected.authorId]),
    ].filter((userId) => userId !== instructorId);
    if (recipients.length) {
      await transaction.notification.createMany({
        data: recipients.map((userId) => ({
          userId,
          type: NotificationType.ANSWER_ACCEPTED,
          title: "An answer was accepted",
          body: "Your lesson question now has an instructor-accepted answer.",
          href: `/dashboard/questions/${question.id}`,
        })),
      });
    }
    return {
      questionId,
      programId: question.lesson.module.programId,
      changed: true,
    };
  });
}
