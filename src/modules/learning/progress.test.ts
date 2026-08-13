import { describe, expect, it } from "vitest";

import { calculateLessonProgress } from "@/modules/learning/progress";

describe("lesson progress", () => {
  it("calculates a deterministic rounded percentage", () => {
    expect(calculateLessonProgress(2, 3)).toEqual({
      completedLessons: 2,
      totalLessons: 3,
      percentage: 67,
    });
  });

  it("returns zero for an empty curriculum", () => {
    expect(calculateLessonProgress(0, 0).percentage).toBe(0);
  });

  it("clamps invalid completion counts", () => {
    expect(calculateLessonProgress(8, 3).percentage).toBe(100);
    expect(calculateLessonProgress(-1, 3).percentage).toBe(0);
  });
});
