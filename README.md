# Yaye Academy V1 — Codex Build Pack

> Product name: **Yaye Academy**  
> Company: **Yaye Tech**  
> Product: **Online Technical Training Platform**  
> Stack: **Next.js + TypeScript + Prisma + PostgreSQL**

This folder is the source of truth for V1.

The goal is to build a complete but controlled first version of an online training platform that a **single technology company** can use to publish and run technical training programs for learners.

## Current implementation status

**Phase 0 — Foundation**, **Phase 1 — Authentication + roles**, **Phase 2 —
Programs + curriculum + batches**, **Phase 3 — Free enrollment + learner
dashboard**, **Phase 4 — Private enrollment**, **Phase 5 — Paid enrollment**,
and **Phase 6 — Live sessions, announcements, and notifications** are
implemented. The repository now includes:

- Next.js App Router with strict TypeScript
- Tailwind CSS and branded public/auth/workspace layouts
- PostgreSQL through Docker Compose
- Prisma with a baseline migration and database health check
- Zod environment validation
- ESLint, Prettier, Vitest, Testing Library, and Playwright
- GitHub Actions quality and database checks
- Better Auth email/password accounts with database-backed sessions
- learner registration plus login and logout
- server-side `ADMIN`, `INSTRUCTOR`, and `LEARNER` access control
- protected, role-specific workspace entry pages
- repeatable development seed accounts
- unit and browser coverage for authentication and role boundaries
- admin CRUD for programs, ordered modules, lessons, and delivery batches
- server-enforced publication readiness and instructor assignment
- a database-backed public program catalog with search and filters
- public program details with curriculum, outcomes, requirements, price, batch,
  and instructor information
- capacity-aware, idempotent enrollment in published free programs
- learner dashboards for active and completed programs
- server-protected curriculum and lesson routes
- lesson completion controls with deterministic program progress
- browser coverage for enrollment, learning access, and progress updates
- secure, expiring, single-use private invitations with intended-email checks
- Chapa-hosted paid checkout with signed webhooks and server verification
- idempotent payment-success enrollment plus learner/admin payment history
- assigned-instructor live-session scheduling with external meeting and resource
  links
- cohort announcements, transactional learner notifications, and unread/read
  state
- enrollment-protected session and announcement views with learner-dashboard
  summaries

The authentication schema supports email-verification records, but outbound
email delivery is intentionally deferred until an email provider is selected.
Private invitation delivery uses a development copy-link state until an email
provider is selected. Phase 7 (lesson Q&A) is the next product slice and can
reuse the notification foundation delivered in Phase 6.

## Local development

Requirements:

- Node.js 24
- npm 11 or newer
- Docker with Docker Compose

Create the local environment file, install dependencies, and start PostgreSQL:

```bash
cp .env.example .env
npm install
docker compose up -d postgres
```

Generate Prisma Client, apply migrations, and verify the connection:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run db:check
```

Start the application:

```bash
npm run dev
```

Open `http://localhost:3000`. The database health endpoint is available at
`http://localhost:3000/api/health`.

The example environment values are for local development only; never commit
production credentials.

Team members working on the remaining phases should follow
[`CONTRIBUTING.md`](CONTRIBUTING.md) for phase ownership, dependencies, branch
names, review requirements, and the commit/push workflow.

The development seed creates these local-only accounts:

| Role       | Email                    | Password           |
| ---------- | ------------------------ | ------------------ |
| Admin      | `admin@example.com`      | `Admin1234!`       |
| Instructor | `instructor@example.com` | `Instructor1234!`  |
| Learner    | `learner@example.com`    | `Learner1234!`     |
| Learner    | `sara@example.com`       | `SaraLearner1234!` |

Run all non-E2E quality checks with:

```bash
npm run verify
```

Run the browser test separately after installing Playwright's Chromium browser:

```bash
npx playwright install chromium
npm run test:e2e
```

## Read these files in order

1. `docs/01_PRODUCT_SPEC.md`
2. `docs/02_USER_FLOWS.md`
3. `docs/03_DOMAIN_MODEL.md`
4. `docs/04_PAGE_AND_ROUTE_MAP.md`
5. `docs/05_IMPLEMENTATION_PLAN.md`
6. `docs/06_CODEX_BUILD_RULES.md`
7. `docs/07_UI_DESIGN_SYSTEM.md`
8. `docs/08_PROGRESS_CALCULATION.md`

## One-sentence product definition

Yaye Academy is Yaye Tech's online technical training platform, where the company can publish free, paid, or private training programs; organize learners into batches; deliver structured lessons and live-session links; run quizzes and practical assignments; answer lesson questions; track progress; accept payments; and issue completion certificates.

## V1 principles

- Build for **one training company**, not multiple companies.
- Online training only.
- Three roles only: **Admin, Instructor, Learner**.
- Programs are **FREE, PAID, or PRIVATE**.
- No application-based enrollment in V1.
- No built-in video calls.
- No self-hosted video streaming.
- No realtime chat.
- Q&A is attached to lessons.
- Use external live-session links such as Google Meet/Zoom.
- Use one payment provider only when the provider is chosen.
- Prefer a finished, understandable system over too many features.

## Definition of done

V1 is complete when a learner can:

1. Register and log in.
2. Browse a public program.
3. Enroll directly in a free program, pay for a paid program, or accept a private invitation.
4. Open the learner dashboard.
5. Work through modules and lessons.
6. Join an external live session.
7. Ask a question under a lesson and receive an instructor answer.
8. Take a multiple-choice quiz.
9. Submit a practical assignment.
10. Receive instructor feedback and a score.
11. See overall progress.
12. Complete the program and view a certificate.

And when instructors/admins can manage the parts of that workflow assigned to their role.

Do not add features that are marked as out of scope in the product spec.
