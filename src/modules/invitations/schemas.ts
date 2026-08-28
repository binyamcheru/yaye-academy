import { z } from "zod";

export const invitationSchema = z.object({
  cohortId: z.string().min(1, "Choose a private-program batch."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid learner email address."),
});
