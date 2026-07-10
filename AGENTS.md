<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Yaye Academy repository instructions

These instructions apply to every Codex session in this repository.

- Read `CODEX_START_PROMPT.md`, `README.md`, and the relevant phase assignment in
  `CONTRIBUTING.md` before changing code.
- Confirm the contributor name, assigned phase, current branch, clean/dirty Git
  state, and latest completed phase before implementation.
- Use npm only. Do not introduce pnpm, Yarn, or Bun files.
- Implement one phase at a time as the smallest complete vertical slice. Do not
  start a contributor's second phase until the first phase is merged and its
  documented dependencies are ready.
- Preserve the established Yaye Academy design system. Reuse existing layouts,
  components, spacing, typography, colors, and interaction patterns.
- Keep authorization and business rules on the server through the existing
  action/service/Prisma structure. Hidden UI is never sufficient protection.
- Protect invariants with schema constraints, transactions, idempotency, and
  tests. Treat enrollment, payments, attempts, submissions, and certificates as
  security-sensitive flows.
- Coordinate every Prisma schema change. Commit migration SQL, update repeatable
  seeds, and validate the migration against PostgreSQL.
- Never commit `.env`, credentials, provider secrets, generated output, test
  reports, or unrelated user changes.
- Run focused tests while building. Before handoff, run `npm run verify`,
  `npm run test:e2e`, `npm run db:check`, and `git diff --check`.
- Make small Conventional Commits on the assigned feature branch. Never commit
  feature work directly to `main` and never force-push `main`.
- Push only the assigned feature branch after all required checks pass. Report
  the branch, commits, tests, migrations, routes, screenshots, and remaining
  decisions in the final handoff.
- If a required product decision is missing, stop at a safe provider-neutral
  boundary and ask the project owner. Phase 5 must not choose a payment provider
  without explicit approval.
