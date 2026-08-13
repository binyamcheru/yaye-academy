import "server-only";

import { type CohortStatus, ProgramStatus, UserRole } from "@prisma/client";

import { prisma } from "@/lib/db";
import { slugify, splitLines } from "@/modules/programs/schemas";

export type ProgramInput = Readonly<{
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl?: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  accessType: "FREE" | "PAID" | "PRIVATE";
  price?: number;
  durationWeeks?: number;
  learningOutcomes: string;
  requirements: string;
}>;

function programData(input: ProgramInput) {
  return {
    title: input.title,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    level: input.level,
    accessType: input.accessType,
    price: input.accessType === "PAID" ? input.price : null,
    durationWeeks: input.durationWeeks,
    learningOutcomes: splitLines(input.learningOutcomes),
    requirements: splitLines(input.requirements),
  };
}

export function listAdminPrograms() {
  return prisma.program.findMany({
    include: {
      _count: { select: { modules: true, cohorts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function listProgramOptions() {
  return prisma.program.findMany({
    select: { id: true, title: true, status: true },
    where: { status: { not: ProgramStatus.ARCHIVED } },
    orderBy: { title: "asc" },
  });
}

export function listInstructorOptions() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    where: { role: UserRole.INSTRUCTOR },
    orderBy: { name: "asc" },
  });
}

export function getAdminProgram(id: string) {
  return prisma.program.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      cohorts: {
        orderBy: { startDate: "asc" },
        include: { instructor: { select: { name: true, email: true } } },
      },
    },
  });
}

export function createProgram(input: ProgramInput, createdById: string) {
  return prisma.program.create({
    data: { ...programData(input), createdById },
  });
}

export function updateProgram(id: string, input: ProgramInput) {
  return prisma.program.update({
    where: { id },
    data: programData(input),
  });
}

export function deleteProgram(id: string) {
  return prisma.program.delete({ where: { id } });
}

export async function changeProgramStatus(id: string, status: ProgramStatus) {
  if (status === ProgramStatus.PUBLISHED) {
    const program = await prisma.program.findUnique({
      where: { id },
      select: {
        accessType: true,
        price: true,
        _count: {
          select: {
            modules: true,
            cohorts: {
              where: {
                instructorId: { not: null },
                status: { in: ["UPCOMING", "ACTIVE"] },
              },
            },
          },
        },
        modules: {
          select: {
            _count: { select: { lessons: { where: { isPublished: true } } } },
          },
        },
      },
    });

    if (!program) throw new Error("Program not found.");
    const publishedLessonCount = program.modules.reduce(
      (total, moduleRecord) => total + moduleRecord._count.lessons,
      0,
    );

    if (!program._count.modules || !publishedLessonCount) {
      throw new Error(
        "Add at least one module and one published lesson before publishing.",
      );
    }
    if (!program._count.cohorts) {
      throw new Error(
        "Assign an instructor to an upcoming or active batch before publishing.",
      );
    }
    if (
      program.accessType === "PAID" &&
      (!program.price || program.price.lte(0))
    ) {
      throw new Error("Set a valid price before publishing a paid program.");
    }
  }

  return prisma.program.update({ where: { id }, data: { status } });
}

export async function createModule(
  programId: string,
  input: Readonly<{ title: string; description?: string }>,
) {
  const aggregate = await prisma.module.aggregate({
    where: { programId },
    _max: { order: true },
  });

  return prisma.module.create({
    data: {
      programId,
      title: input.title,
      description: input.description || null,
      order: (aggregate._max.order ?? 0) + 1,
    },
  });
}

export function updateModule(
  id: string,
  input: Readonly<{ title: string; description?: string }>,
) {
  return prisma.module.update({
    where: { id },
    data: { title: input.title, description: input.description || null },
  });
}

export function deleteModule(id: string) {
  return prisma.module.delete({ where: { id } });
}

export async function createLesson(
  moduleId: string,
  input: Readonly<{
    title: string;
    content: string;
    videoUrl?: string;
    isPublished: boolean;
  }>,
) {
  const aggregate = await prisma.lesson.aggregate({
    where: { moduleId },
    _max: { order: true },
  });

  return prisma.lesson.create({
    data: {
      moduleId,
      title: input.title,
      slug: slugify(input.title),
      content: input.content,
      videoUrl: input.videoUrl || null,
      isPublished: input.isPublished,
      order: (aggregate._max.order ?? 0) + 1,
    },
  });
}

export function updateLesson(
  id: string,
  input: Readonly<{
    title: string;
    content: string;
    videoUrl?: string;
    isPublished: boolean;
  }>,
) {
  return prisma.lesson.update({
    where: { id },
    data: {
      title: input.title,
      slug: slugify(input.title),
      content: input.content,
      videoUrl: input.videoUrl || null,
      isPublished: input.isPublished,
    },
  });
}

export function deleteLesson(id: string) {
  return prisma.lesson.delete({ where: { id } });
}

export function listAdminCohorts() {
  return prisma.cohort.findMany({
    include: {
      program: { select: { title: true } },
      instructor: { select: { name: true, email: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export function getAdminCohort(id: string) {
  return prisma.cohort.findUnique({
    where: { id },
    include: {
      program: { select: { title: true } },
      instructor: { select: { name: true, email: true } },
    },
  });
}

async function assertInstructor(instructorId?: string) {
  if (!instructorId) return;
  const instructor = await prisma.user.findFirst({
    where: { id: instructorId, role: UserRole.INSTRUCTOR },
    select: { id: true },
  });
  if (!instructor) throw new Error("Choose a valid instructor account.");
}

export type CohortInput = Readonly<{
  programId: string;
  instructorId?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  capacity?: number;
  status: CohortStatus;
}>;

export async function createCohort(input: CohortInput) {
  await assertInstructor(input.instructorId);
  return prisma.cohort.create({
    data: {
      ...input,
      instructorId: input.instructorId || null,
      capacity: input.capacity || null,
    },
  });
}

export async function updateCohort(id: string, input: CohortInput) {
  await assertInstructor(input.instructorId);
  return prisma.cohort.update({
    where: { id },
    data: {
      ...input,
      instructorId: input.instructorId || null,
      capacity: input.capacity || null,
    },
  });
}

export function deleteCohort(id: string) {
  return prisma.cohort.delete({ where: { id } });
}
