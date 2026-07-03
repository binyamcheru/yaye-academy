# 05 — Implementation Plan

Build in vertical slices.  
Do not generate the entire application in one step.

Each phase should end with working, testable behavior.

---

# Phase 0 — Project foundation

## Goals

- Create Next.js + TypeScript app.
- Configure PostgreSQL.
- Configure Prisma.
- Add environment validation.
- Add formatting/linting.
- Create basic app layouts.
- Establish folder conventions.

## Suggested dependencies

Core:
- next
- react
- typescript
- prisma
- @prisma/client
- zod

UI:
- tailwindcss
- shadcn/ui (optional but recommended)

Auth:
- choose one consistent auth approach before implementation

Testing:
- vitest or jest
- testing-library
- playwright for critical end-to-end flows

## Acceptance

- app runs
- DB connection works
- Prisma migration works
- CI/lint/typecheck works

---

# Phase 1 — Authentication + roles

Implement:

- learner registration
- login/logout
- password hashing
- session/auth strategy
- email verification if included
- role model
- protected route helpers
- server-side RBAC

Create seed users:

- admin@example.com
- instructor@example.com
- learner@example.com

## Acceptance

- learner cannot access instructor/admin routes
- instructor cannot access admin-only actions
- unauthenticated user cannot access protected learning content

---

# Phase 2 — Programs + curriculum + batches

Implement:

- Program CRUD
- Module CRUD
- Lesson CRUD
- Publish/unpublish program
- Cohort/Batch CRUD
- assign instructor
- public program catalog
- program detail page

## Acceptance

Admin can:

1. Create Backend Development.
2. Add modules.
3. Add lessons.
4. Create a September Batch.
5. Assign an instructor.
6. Publish program.

Visitor can see it publicly.

---

# Phase 3 — Free enrollment + learner dashboard

Implement:

- FREE enrollment
- Enrollment model
- learner dashboard
- My Learning
- protected program access
- lesson page
- lesson completion
- progress calculation

## Acceptance

Learner can:

1. Enroll in a free program.
2. Open learner dashboard.
3. Open lesson.
4. Mark lesson complete.
5. See progress update.

---

# Phase 4 — Private enrollment

Implement:

- admin creates invitation
- secure token
- invitation email or development preview
- learner accepts
- enrollment created
- single-use/expiration rules

## Acceptance

Private program cannot be normally enrolled in publicly.

Only invited learner can activate access.

---

# Phase 5 — Paid enrollment

Before coding, choose the real payment provider.

Implement provider adapter:

```text
PaymentProvider
- createCheckout(...)
- verifyPayment(...)
- handleWebhook(...)
```

Implement:

- checkout page
- PENDING payment
- provider redirect/flow
- webhook/verification
- SUCCESS/FAILED update
- idempotent enrollment creation
- payment history/admin table

## Acceptance

- successful verified payment creates exactly one enrollment
- failed payment creates none
- duplicate webhook does not create duplicate enrollment

---

# Phase 6 — Live sessions + announcements + notifications

Implement:

- instructor creates live session
- learner sees upcoming sessions
- external meeting link
- announcement creation
- in-app notification records

## Acceptance

Learner dashboard reflects new sessions/announcements.

---

# Phase 7 — Lesson Q&A

Implement:

- learner asks question under lesson
- answers
- instructor answer
- accepted answer
- optional upvote
- notifications on answer

## Acceptance

Only eligible enrolled learners can participate.

Instructor can mark exactly one accepted answer.

---

# Phase 8 — Quizzes

Implement:

- instructor/admin creates quiz
- questions
- choices
- publish
- learner attempt
- server grading
- pass/fail
- max attempts
- progress update

## Acceptance

Correct answers are never exposed before submission.

Attempt limit is enforced server-side.

---

# Phase 9 — Assignments + reviews

Implement:

- assignment create/publish
- due date
- learner repository/demo URL submission
- late calculation
- instructor review
- score/feedback
- notification
- progress update

## Acceptance

Learner cannot submit to a cohort they are not enrolled in.

Instructor cannot review submission outside assigned cohort.

---

# Phase 10 — Certificates

Implement:

- completion checker
- certificate issue
- unique certificate code
- learner certificate page
- public verification page
- simple PDF/image export if practical

## Acceptance

Certificate is issued only after requirements are satisfied.

Revoked certificate shows invalid/revoked publicly.

---

# Phase 11 — Dashboards + analytics polish

Learner:
- progress
- upcoming work
- recent feedback

Instructor:
- pending reviews
- unanswered questions
- learner progress

Admin:
- programs
- enrollments
- payment totals
- recent activity
- simple revenue metric

Do not build a complex reporting engine.

---

# Phase 12 — Testing and hardening

Critical tests:

## Auth/RBAC
- learner cannot create program
- instructor cannot access unrelated cohort
- learner cannot access un-enrolled content

## Enrollment
- duplicate free enrollment rejected
- private enrollment requires invitation
- paid enrollment requires verified payment

## Payment
- duplicate webhook is idempotent
- failed payment does not create enrollment

## Quiz
- correct answers hidden before submit
- attempt limit enforced
- grade computed server-side

## Assignment
- unauthorized submission rejected
- late state calculated correctly
- review restricted to authorized instructor

## Certificate
- not issued before completion
- unique code
- revoked cert verifies as revoked

---

# Recommended team split for 5 people

Do not isolate people completely; share domain conventions.

### Person 1 — Public experience + design system
- landing
- programs catalog
- program details
- auth UI

### Person 2 — Auth + roles + enrollment
- auth
- RBAC
- free/private enrollment
- invitations

### Person 3 — Curriculum + learner learning experience
- programs/modules/lessons
- learner program workspace
- progress

### Person 4 — Instructor learning tools
- quizzes
- assignments
- submissions
- Q&A
- live sessions

### Person 5 — Payments + admin + certificates
- payment integration
- admin payment views
- certificates
- admin analytics

All people must follow the same Prisma schema and service conventions.

---

# Git workflow

Recommended:

- `main` is stable
- short-lived feature branches
- PR review before merge
- run lint/typecheck/tests before merge
- do not allow five people to independently edit the Prisma schema without coordination

Schema changes should be reviewed carefully because they affect everyone.
