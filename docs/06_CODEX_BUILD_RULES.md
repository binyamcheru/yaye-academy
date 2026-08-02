# 06 — Codex Build Rules

Give this file to Codex together with the other docs.

---

# Role

You are implementing **Yaye Academy V1**, Yaye Tech's online technical training platform.

The product and scope are defined in the documents in this repository.

Treat those documents as the source of truth.

---

# Non-negotiable stack

Use:

- Next.js
- TypeScript
- Prisma
- PostgreSQL

Do not replace the stack unless explicitly instructed.

---

# Build behavior

## 1. Build incrementally

Do not attempt to generate the entire product at once.

Work phase by phase according to `05_IMPLEMENTATION_PLAN.md`.

At the beginning of each phase:

1. State what you are implementing.
2. List files you expect to add/change.
3. Note any schema changes.
4. Implement the smallest complete vertical slice.
5. Run/typecheck/test where possible.
6. Summarize what works and what remains.

---

## 2. Do not invent product features

Before adding a feature, verify it exists in:

- `01_PRODUCT_SPEC.md`
- `02_USER_FLOWS.md`

If not, do not add it unless explicitly requested.

Examples of forbidden V1 expansion:

- AI tutor
- realtime chat
- multi-tenancy
- built-in video calls
- application-based enrollment
- subscriptions
- complex marketplace

---

## 3. Keep business logic out of UI components

Do not put important authorization/business rules directly inside React components.

Prefer clear server-side layers such as:

```text
UI
→ Server Action / Route Handler
→ Service
→ Prisma
→ PostgreSQL
```

Examples of service areas:

- auth
- program
- enrollment
- payment
- progress
- quiz
- assignment
- certificate
- notification

The exact folders may change, but responsibilities should remain separated.

---

## 4. Server-side authorization is mandatory

Never rely only on hidden buttons.

Every protected mutation/read must verify:

- current user
- current role
- ownership/enrollment/assignment relationship

Examples:

- learner access to lesson requires active enrollment
- instructor review requires assigned cohort
- admin payment view requires ADMIN

---

## 5. Database integrity matters

Use:

- unique constraints
- foreign keys
- indexes
- transactions where needed

Important:

- no duplicate enrollment
- no duplicate lesson-completion record
- no duplicate assignment submission
- no duplicate certificate code
- payment success + enrollment must be idempotent

---

## 6. Payment safety

Do not treat a browser redirect as proof of payment.

Only trusted provider verification/webhook may mark payment SUCCESS.

Do not store raw card data.

Do not create enrollment until payment is verified.

---

## 7. Quiz security

Do not send correct-answer flags to the browser before submission.

Grade on the server.

Enforce max attempts on the server.

---

## 8. Prefer simple V1 solutions

Examples:

- external video URL instead of video hosting
- external Meet/Zoom URL instead of video calls
- lesson Q&A instead of realtime chat
- one certificate template
- one payment provider
- simple analytics
- repository URL assignment submissions

---

## 9. UX expectations

Every major view should handle:

- loading
- empty
- error
- success
- unauthorized/forbidden state

Forms should have:

- validation
- clear errors
- disabled submitting state
- success feedback

---

## 10. Seed data

Create realistic seed data early.

Recommended:

Users:
- one admin
- one instructor
- two learners

Programs:
- Backend Development Bootcamp (PAID)
- Git & GitHub Fundamentals (FREE)
- Internal Security Training (PRIVATE)

Include:
- modules
- lessons
- one cohort each
- sample live sessions
- one quiz
- one assignment

This helps build UI without hardcoded mock arrays.

---

## 11. Avoid premature complexity

Do not introduce:

- microservices
- Kafka
- Kubernetes
- GraphQL
- Redis
- background queue systems

unless a concrete V1 requirement needs them.

Start with a modular Next.js application and PostgreSQL.

---

# Suggested application structure

One possible structure:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── instructor/
│   ├── admin/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── shared/
│   ├── learner/
│   ├── instructor/
│   └── admin/
│
├── modules/
│   ├── auth/
│   ├── programs/
│   ├── cohorts/
│   ├── enrollments/
│   ├── payments/
│   ├── learning/
│   ├── quizzes/
│   ├── assignments/
│   ├── qna/
│   ├── notifications/
│   └── certificates/
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── permissions.ts
│   └── env.ts
│
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

This is guidance, not a reason to create empty folders for everything immediately.

---

# First implementation target

Do not start with payments or certificates.

Start with this vertical slice:

1. Auth works.
2. Admin creates Program.
3. Admin adds Module + Lesson.
4. Admin creates Batch.
5. Learner enrolls in FREE program.
6. Learner opens lesson.
7. Learner marks lesson complete.
8. Progress updates.

Once that works, expand to the next phase.

This proves the core domain before adding expensive integrations.
