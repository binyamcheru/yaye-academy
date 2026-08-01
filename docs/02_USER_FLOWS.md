# 02 — User Flows

This document describes the product from the user's point of view.

---

# A. Learner journey

Use this as the main end-to-end demo scenario.

## Scenario

Sara is a university student who wants to learn backend development.

### Step 1 — Discover

Sara visits the public website.

She can:

- view featured programs
- browse all programs
- search/filter
- open `Backend Development Bootcamp`

### Step 2 — Inspect program

Program detail shows:

- title
- description
- instructor
- level
- curriculum outline
- price/access type
- upcoming batch
- start/end dates
- what she will learn
- requirements

### Step 3 — Register

If not logged in:

`Enroll → Register/Login`

Learner registration collects:

- full name
- email
- password

After registration:

- verify email if enabled
- log in

---

# B. Enrollment flows

## 1. FREE program

`View program → Enroll → ACTIVE enrollment → learner dashboard`

Rules:

- no duplicate enrollment
- only published program/batch can be joined
- capacity rules may be enforced if capacity is used

## 2. PAID program

`View program → Checkout → PENDING payment → provider → verified SUCCESS → ACTIVE enrollment`

If payment fails:

`FAILED payment → no enrollment`

If payment is still pending:

`PENDING payment → no course access`

## 3. PRIVATE program

`Admin creates invitation → learner receives invitation → accepts → ACTIVE enrollment`

Private program should not expose a normal public enroll button.

---

# C. Learner dashboard flow

After enrollment, learner lands on:

`/dashboard`

Dashboard shows:

- active programs
- continue learning
- overall progress
- upcoming live sessions
- upcoming assignments/quizzes
- recent feedback
- recent announcements
- notifications

---

# D. Learning flow

`Dashboard → My Learning → Program → Module → Lesson`

Lesson page contains:

- lesson title
- content
- external video
- resources
- mark complete
- next/previous lesson
- module outline
- lesson Q&A

When learner marks lesson complete:

- save lesson progress
- recalculate module/program progress

---

# E. Q&A flow

Inside lesson:

`Ask Question`

Learner creates:

- title
- body

Other enrolled learners/instructor can answer.

Instructor can mark one answer:

`Accepted Answer`

Learner receives notification when:

- someone answers
- instructor marks accepted answer

No realtime chat behavior is required.

---

# F. Live-session flow

Learner opens Sessions.

Session shows:

- topic
- date/time
- instructor
- external meeting URL

At session time:

`Join Session → external Google Meet/Zoom/etc.`

After session, instructor may add:

- recording URL
- resource URL

---

# G. Quiz flow

`Program → Quizzes → Quiz`

Before attempt:

- number of questions
- pass score
- remaining attempts

During quiz:

- multiple-choice questions
- one selected answer per question

Submit:

- server grades attempt
- score saved
- pass/fail saved
- learner sees result
- progress recalculated

---

# H. Assignment flow

Instructor publishes assignment.

Learner sees:

- instructions
- requirements
- due date
- max score

Learner submits:

- repository/project URL
- optional demo URL
- optional note

System sets:

- SUBMITTED if before deadline
- LATE if after deadline

Instructor reviews:

- score
- feedback
- status becomes REVIEWED

Learner receives notification.

---

# I. Program completion flow

System checks:

- required lessons complete
- required quizzes complete/passed
- required assignments completed/reviewed
- program completion threshold met

Then:

- enrollment/program progress becomes 100%
- completion timestamp saved
- certificate issued
- learner notified

Learner can view/download certificate.

---

# J. Instructor flow

## Instructor login

Instructor lands on:

`/instructor`

Dashboard shows:

- assigned programs/batches
- pending assignment reviews
- unanswered questions
- upcoming live sessions
- learner progress summary

## Teaching flow

Instructor can:

1. Open assigned batch.
2. View learners.
3. Manage or publish lesson content if permission is enabled.
4. Create quiz.
5. Create assignment.
6. Schedule live session.
7. Post announcement.
8. Answer lesson Q&A.
9. Review submissions.
10. View learner progress.

Instructor cannot manage unrelated batches.

---

# K. Admin flow

Admin lands on:

`/admin`

Dashboard shows:

- active learners
- active programs
- batches
- instructors
- recent enrollments
- recent payments
- revenue summary
- recent activity

Admin can:

1. Create program.
2. Create modules/lessons.
3. Publish program.
4. Create batch.
5. Assign instructor.
6. Create/invite instructor account.
7. Manage learners.
8. Invite learner to private program.
9. View enrollments.
10. View payment records.
11. View/issue/revoke certificates.
12. View basic analytics.
13. Manage platform/company settings.

---

# L. Main demo script for V1

This is the recommended demo sequence.

1. Admin creates `Backend Development Bootcamp`.
2. Admin adds modules/lessons.
3. Admin creates `September Batch`.
4. Admin assigns Instructor Abel.
5. Admin publishes the program as PAID.
6. Learner Sara registers.
7. Sara browses the program.
8. Sara pays and is enrolled.
9. Sara opens learner dashboard.
10. Sara completes a lesson.
11. Sara asks a lesson question.
12. Instructor Abel answers it.
13. Sara takes a quiz.
14. Sara submits a GitHub assignment.
15. Abel reviews and scores it.
16. Sara sees feedback and updated progress.
17. Sara completes the remaining requirements.
18. Certificate is issued.
19. Public certificate verification page confirms it.

If this flow works end-to-end, the V1 product is coherent.
