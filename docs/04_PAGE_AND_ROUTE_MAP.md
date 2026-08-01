# 04 — Page and Route Map

This is the agreed Yaye Academy V1 route map. It supersedes earlier route-map
drafts while the product specification remains authoritative for behavior and
permissions.

The application has six route areas:

1. Public website
2. Authentication
3. Payments and enrollment
4. Learner workspace
5. Instructor workspace
6. Admin workspace

Build these routes phase by phase. Shared layouts, tabs, forms, tables, and
dialogs should keep the experience coherent even though the route list is
large.

---

# A. Public website

## `/`

Landing page containing:

- hero
- featured programs
- why learn with Yaye Academy
- how learning works
- instructors preview
- upcoming programs
- learner outcomes or approved testimonials
- registration CTA
- footer

Do not publish invented testimonials, instructor identities, dates, or program
availability. Use approved content or honest preview states until records exist.

## `/programs`

Public program catalog with search and filters for level and FREE/PAID access.
Cards show price, duration, instructor, level, and program status. PRIVATE
programs are not normally discoverable.

## `/programs/[slug]`

Program detail with overview, learning outcomes, requirements, curriculum,
instructor, level, duration, access type, price, upcoming cohort, dates, seats,
and the appropriate enrollment action:

- FREE: enroll
- PAID: continue to checkout
- PRIVATE: invitation-only state

## `/instructors`

Public instructor directory. This is optional for the earliest V1 release but
remains part of the intended site structure.

## `/instructors/[id]`

Public instructor profile with photo, biography, expertise, and programs taught.

## `/about`

Yaye Tech, the academy mission, subjects taught, and practical-learning
approach.

## `/contact`

Basic contact page or form with name, email, subject, and message.

## `/certificates/verify`

Public certificate-code lookup.

## `/certificates/[code]`

Public certificate result showing validity, learner, program, issue date, and
revocation state when relevant.

---

# B. Authentication

## `/login`

Email/password login, password-recovery link, and learner-registration link.

## `/register`

Learner registration only. Users must never self-register as an administrator
or instructor; an administrator creates or invites those accounts.

## `/verify-email`

Email-verification result and resend state.

## `/forgot-password`

Password-reset request.

## `/reset-password`

Set a new password using a valid reset token.

---

# C. Payments and enrollment

## `/checkout/[programId]`

Paid-program summary, selected cohort, fee, total, and payment action.

## `/payment/success`

Success display with a link into learning. This page never decides whether a
payment succeeded; verified server state is authoritative.

## `/payment/failed`

Failure display with retry and return-to-program actions.

---

# D. Learner workspace

All learner routes require an authenticated learner and the appropriate active
enrollment when program content is involved.

## `/dashboard`

Learner home with active programs, continue-learning action, progress, upcoming
sessions and deadlines, announcements, feedback, and notifications.

## `/dashboard/my-learning`

Active and completed program enrollments.

## `/dashboard/programs/[programId]`

Central learner program overview with navigation for learning, assignments,
quizzes, sessions, discussion, and progress.

## `/dashboard/programs/[programId]/learn`

Curriculum with module and lesson states.

## `/dashboard/programs/[programId]/lessons/[lessonId]`

Lesson content, media/resources, previous/complete/next actions, and lesson Q&A.

## `/dashboard/programs/[programId]/discussion`

General enrolled-program discussion.

## `/dashboard/questions/[questionId]`

Question, answers, voting, and accepted-answer state.

## `/dashboard/programs/[programId]/assignments`

Upcoming, submitted, and reviewed assignments.

## `/dashboard/assignments/[assignmentId]`

Assignment instructions, requirements, deadline, resources, submission status,
score, and feedback.

## `/dashboard/assignments/[assignmentId]/submit`

Repository URL, live-demo URL, notes, and optional attachment submission. If the
final form stays small, this route may render as a focused panel while retaining
the route.

## `/dashboard/programs/[programId]/quizzes`

Program quiz list and attempt state.

## `/dashboard/quizzes/[quizId]`

Quiz introduction, pass score, question count, and attempts remaining.

## `/dashboard/quizzes/[quizId]/attempt`

Active quiz attempt. Correct answers must never be sent before submission.

## `/dashboard/quizzes/[quizId]/result`

Server-graded score, pass/fail state, and retry action when allowed.

## `/dashboard/programs/[programId]/sessions`

Upcoming and past live sessions with external meeting, recording, slides, and
resource links when available.

## `/dashboard/programs/[programId]/progress`

Overall progress and lesson, quiz, assignment, and module breakdowns.

## `/dashboard/certificates`

All learner certificates.

## `/dashboard/certificates/[id]`

Certificate details and download action.

## `/dashboard/notifications`

Assignment, Q&A, lesson, session, payment, and certificate notifications.

## `/dashboard/profile`

Name, profile image, biography, GitHub profile, portfolio, and email.

## `/dashboard/settings`

Password and simple email/notification preferences.

---

# E. Instructor workspace

Instructor routes require an authenticated instructor assigned to the relevant
program/cohort.

## `/instructor`

Instructor home with assigned programs, learners, pending submissions,
unanswered questions, and upcoming sessions.

## `/instructor/programs`

Assigned programs and cohorts.

## `/instructor/programs/[programId]`

Program overview for learners, curriculum, assignments, quizzes, sessions,
questions, announcements, and progress.

## `/instructor/programs/[programId]/learners`

Learner list and progress summary.

## `/instructor/learners/[learnerId]`

Authorized learner details, progress, assignment results, quiz scores, and
activity.

## Curriculum management

- `/instructor/programs/[programId]/modules`
- `/instructor/programs/[programId]/modules/new`
- `/instructor/modules/[moduleId]/edit`
- `/instructor/modules/[moduleId]/lessons/new`
- `/instructor/lessons/[lessonId]/edit`

## Assignment management

- `/instructor/programs/[programId]/assignments`
- `/instructor/programs/[programId]/assignments/new`
- `/instructor/assignments/[assignmentId]`
- `/instructor/submissions/[submissionId]`

## Quiz management

- `/instructor/programs/[programId]/quizzes`
- `/instructor/programs/[programId]/quizzes/new`
- `/instructor/quizzes/[quizId]/edit`

## Questions, sessions, announcements, and progress

- `/instructor/questions`
- `/instructor/programs/[programId]/sessions`
- `/instructor/programs/[programId]/sessions/new`
- `/instructor/programs/[programId]/announcements`
- `/instructor/programs/[programId]/announcements/new`
- `/instructor/programs/[programId]/progress`

---

# F. Admin workspace

All admin routes require an authenticated administrator.

## `/admin`

Company-wide learner, program, cohort, instructor, revenue, enrollment, payment,
and activity overview.

## Program management

- `/admin/programs`
- `/admin/programs/new`
- `/admin/programs/[programId]`
- `/admin/programs/[programId]/edit`

Program management covers details, curriculum, cohorts, instructors,
enrollments, payment summary, publication, and archiving.

## Cohort management

- `/admin/cohorts`
- `/admin/cohorts/new`
- `/admin/cohorts/[cohortId]`
- `/admin/cohorts/[cohortId]/edit`

## User management

- `/admin/learners`
- `/admin/learners/[id]`
- `/admin/instructors`
- `/admin/instructors/new`
- `/admin/instructors/[id]`

## Operations

- `/admin/enrollments`
- `/admin/payments`
- `/admin/payments/[paymentId]`
- `/admin/certificates`
- `/admin/analytics`
- `/admin/settings`

Private invitations and manual enrollments can be managed from enrollment and
program-management views instead of requiring a separate destination.

---

# G. Route and interface principles

The product has roughly ten major experiences: discovering programs, enrolling
or paying, using the learner dashboard, learning lessons, Q&A, assignments,
quizzes, live sessions, instructor management, and admin management.

Use:

- pages for major destinations or focused, shareable workflows
- tabs for closely related views within one program or cohort
- dialogs for small create/edit actions
- server actions or route handlers for mutations
- the shared public, learner, instructor, and admin shells

Do not make every CRUD operation visually unique. Reuse the academy's tables,
filters, pagination, forms, cards, status labels, and empty states.
