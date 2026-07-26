import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url("Enter a complete URL.").optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive("Use a positive whole number.").optional(),
);

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().nonnegative("Price cannot be negative.").optional(),
);

export const programSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(140)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens only.",
      ),
    shortDescription: z.string().trim().min(20).max(240),
    description: z.string().trim().min(40).max(5000),
    thumbnailUrl: optionalUrl,
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    accessType: z.enum(["FREE", "PAID", "PRIVATE"]),
    price: optionalPrice,
    durationWeeks: optionalPositiveInteger,
    learningOutcomes: z.string().trim().max(3000),
    requirements: z.string().trim().max(3000),
  })
  .superRefine((data, context) => {
    if (data.accessType === "PAID" && (!data.price || data.price <= 0)) {
      context.addIssue({
        code: "custom",
        message: "Paid programs require a price greater than zero.",
        path: ["price"],
      });
    }
  });

export const moduleSchema = z.object({
  programId: z.string().min(1),
  moduleId: z.string().optional(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).optional(),
});

export const lessonSchema = z.object({
  moduleId: z.string().min(1),
  lessonId: z.string().optional(),
  title: z.string().trim().min(3).max(140),
  content: z.string().trim().min(20).max(20000),
  videoUrl: optionalUrl,
  isPublished: z.boolean(),
});

export const cohortSchema = z
  .object({
    cohortId: z.string().optional(),
    programId: z.string().min(1, "Choose a program."),
    instructorId: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().optional(),
    ),
    name: z.string().trim().min(3).max(120),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: optionalPositiveInteger,
    status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
