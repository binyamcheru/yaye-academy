import "server-only";

import {
  CohortStatus,
  EnrollmentStatus,
  Prisma,
  ProgramAccessType,
  ProgramStatus,
} from "@prisma/client";

import { prisma } from "@/lib/db";
import { calculateLessonProgress } from "@/modules/learning/progress";

export class EnrollmentError extends Error {}

export async function enrollInFreeProgram(userId: string, programId: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const program = await transaction.program.findFirst({
            where: {
              id: programId,
              status: ProgramStatus.PUBLISHED,
              accessType: ProgramAccessType.FREE,
            },
            include: {
              cohorts: {
                where: {
                  status: { in: [CohortStatus.ACTIVE, CohortStatus.UPCOMING] },
                },
                orderBy: { startDate: "asc" },
              },
            },
          });

          if (!program) {
            throw new EnrollmentError(
              "This free program is not available for enrollment.",
            );
          }

          const cohort = program.cohorts[0];
          if (!cohort) {
            throw new EnrollmentError(
              "No open batch is available for this program.",
            );
          }

          const existing = await transaction.enrollment.findUnique({
            where: { userId_cohortId: { userId, cohortId: cohort.id } },
          });
          if (existing && existing.status !== EnrollmentStatus.CANCELLED) {
            return { enrollment: existing, program };
          }

          if (cohort.capacity) {
            const occupiedSeats = await transaction.enrollment.count({
              where: {
                cohortId: cohort.id,
                status: { not: EnrollmentStatus.CANCELLED },
              },
            });
            if (occupiedSeats >= cohort.capacity) {
              throw new EnrollmentError(
                "This batch has reached its learner capacity.",
              );
            }
          }

          const enrollment = existing
            ? await transaction.enrollment.update({
                where: { id: existing.id },
                data: {
                  status: EnrollmentStatus.ACTIVE,
                  completedAt: null,
                  enrolledAt: new Date(),
                },
              })
            : await transaction.enrollment.create({
                data: { userId, cohortId: cohort.id },
              });

          return { enrollment, program };
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
  throw new EnrollmentError(
    "Enrollment could not be completed. Please try again.",
  );
}

const curriculumInclude = {
  cohort: {
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      program: {
        include: {
          modules: {
            orderBy: { order: "asc" as const },
            include: {
              lessons: {
                where: { isPublished: true },
                orderBy: { order: "asc" as const },
              },
            },
          },
        },
      },
    },
  },
  progressRecords: { select: { lessonId: true, completedAt: true } },
} as const;

export async function listLearnerEnrollments(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
    },
    include: curriculumInclude,
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments.map((enrollment) => {
    const lessons = enrollment.cohort.program.modules.flatMap(
      (moduleRecord) => moduleRecord.lessons,
    );
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const completedLessons = enrollment.progressRecords.filter((record) =>
      lessonIds.has(record.lessonId),
    ).length;
    return {
      ...enrollment,
      progress: calculateLessonProgress(completedLessons, lessons.length),
    };
  });
}

export function findLearnerEnrollmentForProgram(
  userId: string,
  programId: string,
) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      cohort: { programId },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function getLearnerProgram(userId: string, programId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      cohort: { programId },
    },
    include: curriculumInclude,
    orderBy: { enrolledAt: "desc" },
  });
  if (!enrollment) return null;

  const lessons = enrollment.cohort.program.modules.flatMap(
    (moduleRecord) => moduleRecord.lessons,
  );
  const completedLessonIds = new Set(
    enrollment.progressRecords.map((record) => record.lessonId),
  );
  return {
    ...enrollment,
    lessons,
    completedLessonIds,
    progress: calculateLessonProgress(
      lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length,
      lessons.length,
    ),
  };
}

export async function getLearnerLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, isPublished: true },
    select: { module: { select: { programId: true } } },
  });
  if (!lesson) return null;
  const workspace = await getLearnerProgram(userId, lesson.module.programId);
  if (!workspace) return null;
  const lessonIndex = workspace.lessons.findIndex(
    (item) => item.id === lessonId,
  );
  if (lessonIndex < 0) return null;
  return {
    ...workspace,
    lesson: workspace.lessons[lessonIndex],
    previousLesson: workspace.lessons[lessonIndex - 1] ?? null,
    nextLesson: workspace.lessons[lessonIndex + 1] ?? null,
    isCompleted: workspace.completedLessonIds.has(lessonId),
  };
}

export async function setLessonCompletion(
  userId: string,
  lessonId: string,
  complete: boolean,
) {
  return prisma.$transaction(async (transaction) => {
    const lesson = await transaction.lesson.findFirst({
      where: { id: lessonId, isPublished: true },
      select: { id: true, module: { select: { programId: true } } },
    });
    if (!lesson) throw new EnrollmentError("Lesson not found.");

    const enrollment = await transaction.enrollment.findFirst({
      where: {
        userId,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
        cohort: { programId: lesson.module.programId },
      },
      orderBy: { enrolledAt: "desc" },
    });
    if (!enrollment)
      throw new EnrollmentError("You do not have access to this lesson.");

    if (complete) {
      await transaction.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
        },
        update: { completedAt: new Date() },
        create: { enrollmentId: enrollment.id, lessonId },
      });
    } else {
      await transaction.lessonProgress.deleteMany({
        where: { enrollmentId: enrollment.id, lessonId },
      });
    }

    const [totalLessons, completedLessons] = await Promise.all([
      transaction.lesson.count({
        where: {
          isPublished: true,
          module: { programId: lesson.module.programId },
        },
      }),
      transaction.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          lesson: {
            isPublished: true,
            module: { programId: lesson.module.programId },
          },
        },
      }),
    ]);
    const progress = calculateLessonProgress(completedLessons, totalLessons);
    await transaction.enrollment.update({
      where: { id: enrollment.id },
      data:
        progress.percentage === 100
          ? { status: EnrollmentStatus.COMPLETED, completedAt: new Date() }
          : { status: EnrollmentStatus.ACTIVE, completedAt: null },
    });
    return progress;
  });
}
