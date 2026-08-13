"use server";

import { Prisma, ProgramStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import {
  cohortSchema,
  lessonSchema,
  moduleSchema,
  programSchema,
} from "@/modules/programs/schemas";
import {
  changeProgramStatus,
  createCohort,
  createLesson,
  createModule,
  createProgram,
  deleteCohort,
  deleteLesson,
  deleteModule,
  deleteProgram,
  updateCohort,
  updateLesson,
  updateModule,
  updateProgram,
} from "@/modules/programs/service";

export type EntityFormState = Readonly<{
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
}>;

function databaseMessage(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "A record with that name, slug, or position already exists.";
  }
  if (error instanceof Error) return error.message;
  return "The operation could not be completed.";
}

function programValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    level: formData.get("level"),
    accessType: formData.get("accessType"),
    price: formData.get("price"),
    durationWeeks: formData.get("durationWeeks"),
    learningOutcomes: formData.get("learningOutcomes"),
    requirements: formData.get("requirements"),
  };
}

export async function createProgramAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const session = await requireRole("ADMIN");
  const result = programSchema.safeParse(programValues(formData));
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  let program;
  try {
    program = await createProgram(result.data, session.user.id);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }

  redirect(`/admin/programs/${program.id}`);
}

export async function updateProgramAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const id = z.string().min(1).safeParse(formData.get("programId"));
  const result = programSchema.safeParse(programValues(formData));
  if (!id.success || !result.success) {
    return {
      status: "error",
      message: !id.success ? "Program not found." : undefined,
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }

  try {
    await updateProgram(id.data, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }

  redirect(`/admin/programs/${id.data}`);
}

export async function programStatusAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const id = z.string().min(1).safeParse(formData.get("programId"));
  const status = z.nativeEnum(ProgramStatus).safeParse(formData.get("status"));
  if (!id.success || !status.success) {
    return { status: "error", message: "Invalid program status request." };
  }

  try {
    await changeProgramStatus(id.data, status.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/admin/programs/${id.data}`);
  return {
    status: "success",
    message: `Program is now ${status.data.toLowerCase()}.`,
  };
}

export async function deleteProgramAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = z.string().min(1).parse(formData.get("programId"));
  await deleteProgram(id);
  revalidatePath("/", "layout");
  redirect("/admin/programs");
}

export async function createModuleAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const result = moduleSchema.safeParse({
    programId: formData.get("programId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }

  try {
    await createModule(result.data.programId, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  revalidatePath(`/admin/programs/${result.data.programId}`);
  return { status: "success", message: "Module added." };
}

export async function updateModuleAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const result = moduleSchema.safeParse({
    programId: formData.get("programId"),
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!result.success || !result.data.moduleId) {
    return {
      status: "error",
      message: !result.success ? undefined : "Module not found.",
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }
  try {
    await updateModule(result.data.moduleId, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  revalidatePath(`/admin/programs/${result.data.programId}`);
  return { status: "success", message: "Module updated." };
}

export async function deleteModuleAction(formData: FormData) {
  await requireRole("ADMIN");
  const moduleId = z.string().min(1).parse(formData.get("moduleId"));
  const programId = z.string().min(1).parse(formData.get("programId"));
  await deleteModule(moduleId);
  revalidatePath(`/admin/programs/${programId}`);
}

function lessonValues(formData: FormData) {
  return {
    moduleId: formData.get("moduleId"),
    lessonId: formData.get("lessonId") || undefined,
    title: formData.get("title"),
    content: formData.get("content"),
    videoUrl: formData.get("videoUrl"),
    isPublished: formData.get("isPublished") === "on",
  };
}

export async function createLessonAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const programId = z.string().min(1).safeParse(formData.get("programId"));
  const result = lessonSchema.safeParse(lessonValues(formData));
  if (!programId.success || !result.success) {
    return {
      status: "error",
      message: !programId.success ? "Program not found." : undefined,
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }
  try {
    await createLesson(result.data.moduleId, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  revalidatePath(`/admin/programs/${programId.data}`);
  return { status: "success", message: "Lesson added." };
}

export async function updateLessonAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const programId = z.string().min(1).safeParse(formData.get("programId"));
  const result = lessonSchema.safeParse(lessonValues(formData));
  if (!programId.success || !result.success || !result.data.lessonId) {
    return {
      status: "error",
      message:
        !programId.success || !result.data?.lessonId
          ? "Lesson not found."
          : undefined,
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }
  try {
    await updateLesson(result.data.lessonId, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  revalidatePath(`/admin/programs/${programId.data}`);
  return { status: "success", message: "Lesson updated." };
}

export async function deleteLessonAction(formData: FormData) {
  await requireRole("ADMIN");
  const lessonId = z.string().min(1).parse(formData.get("lessonId"));
  const programId = z.string().min(1).parse(formData.get("programId"));
  await deleteLesson(lessonId);
  revalidatePath(`/admin/programs/${programId}`);
}

function cohortValues(formData: FormData) {
  return {
    cohortId: formData.get("cohortId") || undefined,
    programId: formData.get("programId"),
    instructorId: formData.get("instructorId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    capacity: formData.get("capacity"),
    status: formData.get("status"),
  };
}

export async function createCohortAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const result = cohortSchema.safeParse(cohortValues(formData));
  if (!result.success) {
    return { status: "error", errors: result.error.flatten().fieldErrors };
  }
  let cohort;
  try {
    cohort = await createCohort(result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  redirect(`/admin/cohorts/${cohort.id}`);
}

export async function updateCohortAction(
  _previousState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  await requireRole("ADMIN");
  const result = cohortSchema.safeParse(cohortValues(formData));
  if (!result.success || !result.data.cohortId) {
    return {
      status: "error",
      message: !result.success ? undefined : "Batch not found.",
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }
  try {
    await updateCohort(result.data.cohortId, result.data);
  } catch (error) {
    return { status: "error", message: databaseMessage(error) };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/cohorts/${result.data.cohortId}`);
}

export async function deleteCohortAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = z.string().min(1).parse(formData.get("cohortId"));
  await deleteCohort(id);
  revalidatePath("/", "layout");
  redirect("/admin/cohorts");
}
