import { z } from "zod";

export const questionSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().trim().min(5).max(160),
  body: z.string().trim().min(10).max(5000),
});

export const answerSchema = z.object({
  questionId: z.string().min(1),
  body: z.string().trim().min(5).max(5000),
});

export const acceptAnswerSchema = z.object({
  questionId: z.string().min(1),
  answerId: z.string().min(1),
});
