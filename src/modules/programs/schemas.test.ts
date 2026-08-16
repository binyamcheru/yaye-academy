import { describe, expect, it } from "vitest";

import {
  cohortSchema,
  programSchema,
  slugify,
  splitLines,
} from "@/modules/programs/schemas";

const validProgram = {
  title: "Backend Development",
  slug: "backend-development",
  shortDescription: "A practical backend development program.",
  description:
    "Learn to design, build, test, and deploy maintainable backend services.",
  thumbnailUrl: "",
  level: "INTERMEDIATE",
  accessType: "PAID",
  price: "4000",
  durationWeeks: "12",
  learningOutcomes: "Build APIs\nModel relational data",
  requirements: "JavaScript fundamentals",
};

describe("program input", () => {
  it("accepts a priced paid program", () => {
    expect(programSchema.safeParse(validProgram).success).toBe(true);
  });

  it("rejects a paid program without a positive price", () => {
    const result = programSchema.safeParse({ ...validProgram, price: "" });
    expect(result.success).toBe(false);
  });

  it("normalizes slugs and line lists", () => {
    expect(slugify("  Git & GitHub Fundamentals ")).toBe(
      "git-github-fundamentals",
    );
    expect(splitLines("One\n\n Two ")).toEqual(["One", "Two"]);
  });
});

describe("cohort input", () => {
  it("requires the end date to follow the start date", () => {
    const result = cohortSchema.safeParse({
      programId: "program-id",
      instructorId: "instructor-id",
      name: "September Batch",
      startDate: "2026-09-30",
      endDate: "2026-09-01",
      capacity: "30",
      status: "UPCOMING",
    });

    expect(result.success).toBe(false);
  });
});
