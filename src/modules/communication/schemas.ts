import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().url("Enter a complete URL.").optional(),
);

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const utcInstant = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
    "Choose a valid date and time.",
  )
  .transform((value) => new Date(value));

const optionalUtcInstant = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  utcInstant.optional(),
);

export const liveSessionSchema = z
  .object({
    programId: z.string().min(1),
    cohortId: z.string().min(1, "Choose a batch."),
    title: z.string().trim().min(3).max(140),
    description: optionalText(2000),
    startsAt: utcInstant,
    endsAt: optionalUtcInstant,
    meetingUrl: z.string().url("Enter a complete meeting URL."),
    recordingUrl: optionalUrl,
    slidesUrl: optionalUrl,
    resourceUrl: optionalUrl,
  })
  .refine((data) => !data.endsAt || data.endsAt > data.startsAt, {
    message: "End time must be after the start time.",
    path: ["endsAt"],
  });

export const announcementSchema = z.object({
  programId: z.string().min(1),
  cohortId: z.string().min(1, "Choose a batch."),
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(10).max(5000),
});
