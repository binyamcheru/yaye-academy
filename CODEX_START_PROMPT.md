# Codex Start Prompt

Read these files before changing code:

1. `AGENTS.md`
2. `README.md`
3. `CONTRIBUTING.md` when working as a team contributor
4. `docs/01_PRODUCT_SPEC.md`
5. `docs/02_USER_FLOWS.md`
6. `docs/03_DOMAIN_MODEL.md`
7. `docs/04_PAGE_AND_ROUTE_MAP.md`
8. `docs/05_IMPLEMENTATION_PLAN.md`
9. `docs/06_CODEX_BUILD_RULES.md`
10. `docs/07_UI_DESIGN_SYSTEM.md`
11. `docs/08_PROGRESS_CALCULATION.md`

We are building **Yaye Academy V1** for **Yaye Tech** with:

- Next.js
- TypeScript
- Prisma
- PostgreSQL

Treat the documentation as the source of truth.

Do **not** build the entire product in one pass.

Check `README.md` and the Git history for the current implementation status,
then continue with the next unfinished phase in `docs/05_IMPLEMENTATION_PLAN.md`.

Before coding:

1. Briefly summarize your understanding of the product.
2. State the exact work for the next unfinished phase.
3. List the files/config you expect to create or modify.
4. Point out any assumptions.

When a contributor name and phase are provided, use that contributor's section
in `CONTRIBUTING.md` as the implementation contract. Work on only that phase and
its assigned branch. Commit verified vertical chunks while building, then push
only the feature branch after the full required checks pass.

Then implement only that phase in small, tested commits.

Do not add out-of-scope features.
