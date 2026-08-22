# Contributing to Yaye Academy

Yaye Academy is Yaye Tech's technical training platform. Phases 0–3 are already
implemented on `main`; this guide assigns ownership for Phases 4–12 and defines
how the team should build, review, commit, and push the remaining work.

The product documents remain the source of truth. Before starting a phase, read
these files in order:

1. `README.md`
2. `docs/01_PRODUCT_SPEC.md`
3. `docs/02_USER_FLOWS.md`
4. `docs/03_DOMAIN_MODEL.md`
5. `docs/04_PAGE_AND_ROUTE_MAP.md`
6. `docs/05_IMPLEMENTATION_PLAN.md`
7. `docs/06_CODEX_BUILD_RULES.md`
8. `docs/07_UI_DESIGN_SYSTEM.md`
9. `docs/08_PROGRESS_CALCULATION.md`

## Codex quick start for contributors

You do not need to design the architecture or remember every command yourself.
Codex should inspect the repository, implement the assigned behavior, run the
checks, and create the commits. Your responsibility is to give it the correct
phase, answer real product questions, visually review the result, and open the
pull request.

### One-time local setup

Each person should use a separate clone or Git worktree. Do not let several
contributors run Codex in the same working directory.

```bash
git clone <repository-url>
cd yaye-academy
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:deploy
npm run db:seed
npm run db:check
```

Open the `yaye-academy` folder itself in the IDE, not only its parent folder.
Keep secrets in `.env`; never paste them into a Codex message, commit, screenshot,
or pull request.

### Ready-to-paste first prompt

Copy only the prompt with your name. These prompts intentionally point Codex to
the durable repository rules instead of repeating the full specification.

#### Ashenafi — start Phase 4

```text
I am Ashenafi Mulugeta. Implement Phase 4, private enrollment, on the branch
feat/phase-4-private-enrollment. Read AGENTS.md, CODEX_START_PROMPT.md, and my
Phase 4 section in CONTRIBUTING.md, then read the linked product documents.
Inspect the current implementation and Git state before editing. Implement only
Phase 4 as a complete tested vertical slice. Preserve the Yaye Academy UI and
server-side authorization conventions. Create small verified commits using the
suggested boundaries, run every required final check, push only this feature
branch to origin, and give me a pull-request handoff. Stop before Phase 5.
```

#### Azarya — start Phase 6

```text
I am Azarya Melkamu. Implement Phase 6, live sessions, announcements, and
notifications, on the branch feat/phase-6-learning-communication. Read AGENTS.md,
CODEX_START_PROMPT.md, and my Phase 6 section in CONTRIBUTING.md, then read the
linked product documents. Inspect the current implementation and Git state
before editing. Implement only Phase 6 as a complete tested vertical slice.
Preserve the Yaye Academy UI and enforce cohort authorization on the server.
Create small verified commits using the suggested boundaries, run every required
final check, push only this feature branch to origin, and give me a pull-request
handoff. Stop before Phase 7.
```

#### Anasimos — start Phase 8

```text
I am Anasimos Derbe. Implement Phase 8, quizzes, on the branch
feat/phase-8-quizzes. Read AGENTS.md, CODEX_START_PROMPT.md, and my Phase 8
section in CONTRIBUTING.md, then read the linked product documents. Inspect the
current implementation and Git state before editing. Implement only Phase 8 as
a complete tested vertical slice. Keep answers secret until submission and grade
and limit attempts on the server. Create small verified commits using the
suggested boundaries, run every required final check, push only this feature
branch to origin, and give me a pull-request handoff. Stop before Phase 10.
```

#### Anna — start Phase 9

```text
I am Anna Adiyu. Implement Phase 9, assignments and reviews, on the branch
feat/phase-9-assignments. Read AGENTS.md, CODEX_START_PROMPT.md, and my Phase 9
section in CONTRIBUTING.md, then read the linked product documents. Inspect the
current implementation and Git state before editing. Implement only Phase 9 as
a complete tested vertical slice. Preserve the Yaye Academy UI and enforce
enrollment and instructor-cohort authorization on the server. Create small
verified commits using the suggested boundaries, run every required final check,
push only this feature branch to origin, and give me a pull-request handoff. Stop
before Phase 11.
```

### Starting the second assigned phase

Start the second phase in a new Codex conversation and a new branch only after
the first pull request is merged. Copy the matching prompt below. Codex must
confirm that every dependency in the “Delivery order and dependencies” section
is already present before editing.

<details>
<summary>Ashenafi — start Phase 5 after the provider decision</summary>

```text
I am Ashenafi Mulugeta. Implement Phase 5, paid enrollment, on the branch
feat/phase-5-paid-enrollment. Read AGENTS.md, CODEX_START_PROMPT.md, my Phase 5
section in CONTRIBUTING.md, and the linked product documents. Confirm Phase 4 is
merged and identify the project owner's approved payment provider before editing.
If the provider is still undecided, stop and report the decision needed. Otherwise
implement only Phase 5 as a complete, secure, tested vertical slice. Create small
verified commits, run every required final check, push only this feature branch,
and give me a pull-request handoff.
```

</details>

<details>
<summary>Azarya — start Phase 7 after Phase 6 merges</summary>

```text
I am Azarya Melkamu. Implement Phase 7, lesson Q&A, on the branch
feat/phase-7-lesson-qa. Read AGENTS.md, CODEX_START_PROMPT.md, my Phase 7 section
in CONTRIBUTING.md, and the linked product documents. Confirm Phase 6 and its
notification infrastructure are merged before editing. Implement only Phase 7
as a complete tested vertical slice with enrollment and instructor-cohort checks
on the server. Create small verified commits, run every required final check,
push only this feature branch, and give me a pull-request handoff.
```

</details>

<details>
<summary>Anasimos — start Phase 10 after Phases 8 and 9 merge</summary>

```text
I am Anasimos Derbe. Implement Phase 10, certificates, on the branch
feat/phase-10-certificates. Read AGENTS.md, CODEX_START_PROMPT.md, my Phase 10
section in CONTRIBUTING.md, and the linked product documents. Confirm Phases 8
and 9 and their final progress rules are merged before editing. Implement only
Phase 10 as a complete tested vertical slice with idempotent issuance and public
revocation checks. Create small verified commits, run every required final check,
push only this feature branch, and give me a pull-request handoff.
```

</details>

<details>
<summary>Anna — start Phase 11 after Phases 5–10 merge</summary>

```text
I am Anna Adiyu. Implement Phase 11, dashboard and analytics polish, on the branch
feat/phase-11-dashboard-polish. Read AGENTS.md, CODEX_START_PROMPT.md, my Phase 11
section in CONTRIBUTING.md, and the linked product documents. Confirm Phases 5–10
are merged before editing. Reuse their services and do not duplicate business
logic. Implement only Phase 11 as a complete tested vertical slice with accurate,
authorized, efficient role dashboards. Create small verified commits, run every
required final check, push only this feature branch, and give me a pull-request
handoff.
```

</details>

For Phase 12, each person should ask Codex to implement only the hardening row
assigned to their name, add regression coverage for every discovered bug, and
commit the work on a separate `test/phase-12-<area>` branch.

### How to steer Codex without coding

- If Codex only gives a plan, say: “Proceed with the implementation, tests,
  commits, and feature-branch push. Keep me updated while you work.”
- If a test fails, say: “Diagnose and fix the root cause. Do not skip, delete, or
  weaken the test.”
- If the UI changes, say: “Open the affected pages, inspect them at desktop and
  mobile sizes, and show me the screenshots before committing the final UI.”
- If Codex proposes an extra feature, say: “Check the product documents. Keep it
  out unless it is required by this phase.”
- If Codex asks about payment provider, email provider, file storage, or another
  undecided external service, ask the project owner. Do not guess.
- If Codex finds unrelated local changes, tell it to preserve them and commit
  only files belonging to the assigned phase.

### What to check before accepting the result

Ask Codex to show these facts in its final handoff:

- the current feature branch and a clean `git status`
- the commit hashes and messages it created
- the exact tests run and number passing
- new migrations and environment-variable names
- routes and role permissions added or changed
- screenshots for every important visible workflow
- confirmation that `.env` and secrets are not committed
- the pushed branch name and the suggested pull-request title

Do not merge just because the page looks correct. The browser test, server-side
authorization rejection test, Prisma migration, and full verification commands
must also pass.

## Team ownership

Ownership means leading the database design, server-side authorization,
services, interface, tests, documentation, and pull-request fixes for the
assigned phases. It does not mean working without review or changing shared
contracts without telling the team.

| Contributor       | Primary phases | Area                                            |
| ----------------- | -------------- | ----------------------------------------------- |
| Ashenafi Mulugeta | 4 and 5        | Private invitations and paid enrollment         |
| Azarya Melkamu    | 6 and 7        | Sessions, announcements, notifications, and Q&A |
| Anasimos Derbe    | 8 and 10       | Quizzes, completion, and certificates           |
| Anna Adiyu        | 9 and 11       | Assignments, reviews, dashboards, and analytics |
| Whole team        | 12             | Cross-feature testing, security, and hardening  |

## Ashenafi Mulugeta

### Phase 4 — Private enrollment

Branch: `feat/phase-4-private-enrollment`

Implement:

- an invitation model related to the private program cohort and invited email
- cryptographically secure invitation tokens; store a hash, never the raw token
- expiration, acceptance, cancellation, and single-use rules
- an admin invitation form and invitation status list
- a development preview/copy-link state until an email provider is selected
- an invitation acceptance page for the intended authenticated learner
- idempotent enrollment creation after valid acceptance
- protection that keeps private programs out of normal public enrollment
- unit tests for token and expiration rules
- browser tests for admin creation, intended-learner acceptance, reuse rejection,
  and wrong-account rejection

Acceptance:

- A learner cannot directly enroll in a private program.
- Only the invited email can accept an unexpired, unused invitation.
- Accepting creates exactly one enrollment and consumes the invitation.

Suggested commits:

```text
feat(db): model private program invitations
feat(enrollment): add secure private invitation flow
test(enrollment): cover private invitation boundaries
```

### Phase 5 — Paid enrollment

Branch: `feat/phase-5-paid-enrollment`

Do not start provider-specific code until the project owner records the selected
payment provider and test credentials. Never invent a provider or treat a browser
redirect as proof of payment.

Implement:

- a provider-neutral `PaymentProvider` adapter
- payment records with pending, successful, and failed states
- checkout, success, and failure pages from the route map
- trusted verification/webhook handling
- signature verification and duplicate-event idempotency
- transactional enrollment creation only after verified success
- admin payment list and payment detail views
- learner-visible payment history/status where required
- unit tests for the adapter boundary and payment state transitions
- browser/integration tests for success, failure, and duplicate webhook behavior

Acceptance:

- Verified success creates exactly one enrollment.
- Failure creates no enrollment.
- Replaying the same provider event changes nothing after the first success.
- No raw card information enters Yaye Academy.

Suggested commits:

```text
feat(db): model payment lifecycle
feat(payments): add provider adapter and verified checkout
feat(admin): add payment operations views
test(payments): prove webhook idempotency
```

## Azarya Melkamu

### Phase 6 — Live sessions, announcements, and notifications

Branch: `feat/phase-6-learning-communication`

Implement:

- live-session, announcement, and notification models
- instructor session creation for assigned cohorts only
- external Meet/Zoom link, time, recording, slides, and resource fields
- instructor announcements for assigned cohorts
- learner session, announcement, and notification views
- unread/read notification state
- learner-dashboard summaries for upcoming sessions and recent announcements
- time-zone-safe server storage and clear local display
- authorization tests for unrelated instructors and unenrolled learners
- browser tests for instructor creation and enrolled-learner visibility

Acceptance:

- An assigned instructor can publish a session or announcement.
- Only eligible enrolled learners see cohort content.
- The learner dashboard reflects newly published information.

Suggested commits:

```text
feat(db): model cohort communication
feat(instructor): manage sessions and announcements
feat(learner): surface notifications and upcoming sessions
test(communication): enforce cohort visibility
```

### Phase 7 — Lesson Q&A

Branch: `feat/phase-7-lesson-qa`

Implement:

- question and answer models attached to lessons and users
- learner question creation from an enrolled, accessible lesson
- learner/instructor answers with ownership and cohort checks
- exactly one accepted answer per question
- instructor unanswered-question queue
- answer and accepted-answer notifications using Phase 6 infrastructure
- question detail and lesson Q&A interfaces from the route map
- optional upvotes only after the required Q&A flow is complete
- unit tests for accepted-answer invariants
- browser tests for learner questions, instructor answers, and access rejection

Acceptance:

- Only eligible enrolled learners participate.
- Only an authorized instructor can select the accepted answer.
- A question never has more than one accepted answer.

Suggested commits:

```text
feat(db): model lesson questions and answers
feat(learning): add enrolled lesson questions
feat(instructor): add answer and acceptance workflow
test(qa): cover participation and acceptance rules
```

## Anasimos Derbe

### Phase 8 — Quizzes

Branch: `feat/phase-8-quizzes`

Implement:

- quiz, question, choice, and attempt models
- instructor/admin quiz authoring and publication
- pass score and maximum-attempt configuration
- enrolled learner quiz list, introduction, attempt, and result pages
- server-only answer-key loading and server-side grading
- transactional attempt-limit enforcement
- pass/fail results and progress integration
- seed data for at least one realistic quiz
- unit tests for grading and attempt rules
- browser tests proving answers are hidden before submission

Acceptance:

- Correct-answer flags never appear in browser data before submission.
- Attempts and scores are calculated and limited on the server.
- Completing a published quiz updates program progress correctly.

Suggested commits:

```text
feat(db): model quizzes and attempts
feat(instructor): add quiz authoring workflow
feat(learner): add secure quiz attempts and results
test(quizzes): protect answers and attempt limits
```

### Phase 10 — Certificates

Branch: `feat/phase-10-certificates`

Start after the Phase 8 and Phase 9 progress requirements are merged.

Implement:

- a shared completion checker using lessons, quizzes, and assignments
- certificate records with unique, non-guessable public codes
- idempotent issuance after all completion requirements are satisfied
- learner certificate list and detail pages
- public certificate lookup and verification pages
- admin certificate list and revocation workflow
- valid, invalid, missing, and revoked public states
- one simple download/export format only if practical
- unit tests for completion, uniqueness, issuance, and revocation
- browser tests for early-issuance rejection and public verification

Acceptance:

- Incomplete learners cannot receive certificates.
- Repeated issuance produces one certificate.
- Revoked certificates display as revoked publicly.

Suggested commits:

```text
feat(db): model program certificates
feat(certificates): issue and verify completion records
feat(admin): add certificate revocation
test(certificates): cover issuance and public validity
```

## Anna Adiyu

### Phase 9 — Assignments and reviews

Branch: `feat/phase-9-assignments`

Implement:

- assignment, submission, and review fields/models
- instructor assignment authoring and publication for assigned cohorts
- due dates, requirements, resources, and scoring configuration
- learner assignment list, details, and submission flow
- repository URL, live-demo URL, notes, and optional supported attachment
- server-calculated late state
- one active submission per learner/assignment unless the spec permits revision
- instructor review with score and feedback
- review notification using Phase 6 infrastructure
- assignment completion in the progress calculation
- unit tests for late calculation and authorization
- browser tests for submit, review, feedback, and unauthorized access

Acceptance:

- Unenrolled learners cannot submit.
- Instructors cannot review outside their assigned cohorts.
- Learners see the authoritative score and feedback after review.

Suggested commits:

```text
feat(db): model assignments and submissions
feat(learner): add practical assignment submission
feat(instructor): add submission review workflow
test(assignments): cover lateness and authorization
```

### Phase 11 — Dashboards and analytics polish

Branch: `feat/phase-11-dashboard-polish`

Start after the feature data from Phases 5–10 is available. Coordinate with the
owner of each domain instead of duplicating their business logic.

Implement:

- learner upcoming work, sessions, progress, notifications, and recent feedback
- instructor pending reviews, unanswered questions, cohort progress, and sessions
- admin program, enrollment, payment, revenue, and recent-activity summaries
- efficient server queries and intentional empty/loading/error states
- responsive tables/cards using the existing Yaye Academy design system
- simple totals and trends only; no complex reporting engine
- unit tests for analytics calculations
- browser smoke tests for all three role dashboards

Acceptance:

- Every role sees accurate, authorized, database-backed summaries.
- Empty states remain useful for new installations.
- Dashboard queries avoid obvious per-row query loops.

Suggested commits:

```text
feat(learner): expand learning dashboard summaries
feat(instructor): add teaching operations dashboard
feat(admin): add academy analytics overview
test(dashboards): cover role-specific summaries
```

## Phase 12 — Shared testing and hardening

Testing is part of every phase; Phase 12 closes cross-feature gaps rather than
postponing all tests until the end.

| Owner             | Final hardening responsibility                                    |
| ----------------- | ----------------------------------------------------------------- |
| Ashenafi Mulugeta | Auth, free/private/paid enrollment, and payment replay tests      |
| Azarya Melkamu    | Instructor assignment, Q&A, sessions, and notification boundaries |
| Anasimos Derbe    | Quiz secrecy/attempt limits and certificate issuance/revocation   |
| Anna Adiyu        | Assignment authorization/lateness and dashboard regressions       |

Each contributor must also review another contributor's pull request:

- Azarya reviews Ashenafi.
- Anasimos reviews Azarya.
- Anna reviews Anasimos.
- Ashenafi reviews Anna.

The final hardening pull requests must include regression tests for any bug they
fix. Do not hide failing tests, lower coverage by deleting tests, or weaken an
authorization assertion to make a test pass.

## Delivery order and dependencies

The normal merge order is Phase 4 through Phase 12. Parallel research and UI
work are welcome, but merge shared database contracts in coordinated order.

Important dependencies:

- Phase 5 waits for a real payment-provider decision.
- Phase 7 uses the Phase 6 notification foundation.
- Phase 9 uses Phase 6 review notifications.
- Phase 10 waits for the Phase 8 and Phase 9 completion rules.
- Phase 11 waits for the data produced by Phases 5–10.
- Phase 12 begins continuously and finishes after every feature phase is merged.

Only one pull request that changes `prisma/schema.prisma` should be in final merge
review at a time. After another schema pull request merges, rebase on `main`,
resolve the schema deliberately, apply all migrations to a clean local database,
and rerun the full verification suite.

## Branch, commit, and push workflow

Never commit feature work directly to `main`.

Create the assigned branch from the latest `main`:

```bash
git switch main
git pull --ff-only
git switch -c feat/phase-N-short-name
```

Make small commits that each leave the repository understandable. Use the
project's Conventional Commit style:

```text
feat(scope): add a user-visible capability
fix(scope): correct broken behavior
test(scope): add or strengthen coverage
docs(scope): update project documentation
refactor(scope): restructure without changing behavior
```

Before every push:

```bash
npm run verify
npm run test:e2e
npm run db:check
git diff --check
git status
```

Commit and push the branch:

```bash
git add <only-the-files-for-this-commit>
git commit -m "feat(scope): concise description"
git push -u origin feat/phase-N-short-name
```

Open a pull request into `main`. Its description must include:

- the phase and acceptance criteria completed
- database migrations and environment variables added
- routes and permissions added or changed
- tests run and their result
- screenshots for visible interface changes
- known limitations and follow-up work

Do not commit `.env`, secrets, provider keys, `.next`, Playwright reports,
`node_modules`, or generated Prisma Client files. Do commit Prisma migration SQL
and `.env.example` changes that document non-secret configuration names.

## Definition of done for every phase

A phase is ready to merge only when:

1. Its smallest complete learner/admin/instructor journey works.
2. Authentication, role, enrollment, and cohort ownership are checked on the
   server for every protected read and mutation.
3. Database constraints and transactions protect important invariants.
4. Seed data remains repeatable and realistic.
5. Empty, error, success, and unauthorized states are handled.
6. Unit and Playwright acceptance tests cover the important happy and rejection
   paths.
7. `npm run verify`, `npm run test:e2e`, and `npm run db:check` pass.
8. Documentation reflects what is implemented and identifies the next phase.
9. A teammate has reviewed and approved the pull request.

If a product decision is missing—especially the Phase 5 payment provider—stop
at the provider-neutral boundary, document the blocker, and ask the project
owner. Do not silently choose product behavior.
