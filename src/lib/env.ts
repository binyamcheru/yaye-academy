import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) =>
        value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must be a PostgreSQL connection string",
    ),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().min(1).default("Yaye Academy"),
  DEFAULT_CURRENCY: z.string().length(3).default("ETB"),
  DEFAULT_TIMEZONE: z.string().min(1).default("Africa/Addis_Ababa"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  CHAPA_SECRET_KEY: z
    .string()
    .min(16, "CHAPA_SECRET_KEY must be a Chapa test or live secret key"),
  CHAPA_WEBHOOK_SECRET: z
    .string()
    .min(32, "CHAPA_WEBHOOK_SECRET must be at least 32 characters"),
  CHAPA_MODE: z.enum(["test", "live"]).default("test"),
  PAYMENT_TEST_ADAPTER: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return result.data;
}

export const env = parseServerEnv(process.env);
