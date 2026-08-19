# 08 — Progress Calculation

Yaye Academy calculates progress on the server from published learning work.
Clients display the result but do not decide it.

## Phase 3 rule

Only published lessons count during Phase 3:

```text
progress = round(completed published lessons / total published lessons × 100)
```

- An enrollment with no published lessons has `0%` progress.
- Completing the final published lesson marks the enrollment `COMPLETED` and
  records its completion time.
- Reopening any lesson returns the enrollment to `ACTIVE` and clears that time.
- Unpublished lessons never change the numerator or denominator.
- Repeating the same completion request does not create duplicate progress.

## Later phases

The V1 product model reserves these category weights:

| Category    | Weight |
| ----------- | -----: |
| Lessons     |    60% |
| Quizzes     |    20% |
| Assignments |    20% |

Quizzes and assignments are not implemented yet, so Phase 3 redistributes their
weight to lessons. When those categories are introduced, a category with no
published items will have its weight redistributed proportionally across the
categories that do have published items. The final result remains rounded to a
whole percentage.
