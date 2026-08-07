export type LessonProgress = Readonly<{
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}>;

/**
 * Phase 3 only has lesson completion. The product formula redistributes weight
 * from categories that do not exist yet, so published lessons currently make
 * up 100% of progress. Quiz and assignment weights will be added with those
 * features while keeping this function as the calculation boundary.
 */
export function calculateLessonProgress(
  completedLessons: number,
  totalLessons: number,
): LessonProgress {
  const safeTotal = Math.max(0, totalLessons);
  const safeCompleted = Math.min(Math.max(0, completedLessons), safeTotal);
  return {
    completedLessons: safeCompleted,
    totalLessons: safeTotal,
    percentage: safeTotal ? Math.round((safeCompleted / safeTotal) * 100) : 0,
  };
}
