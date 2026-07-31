# 01 — Product Specification

## 1. Product goal

Build an online technical training platform for a **single technology company** that provides structured training to the public and to invited learners.

The product should feel like software a real training business could operate, not a demo course website.

The platform should manage the full online training lifecycle:

**Discover → Enroll → Learn → Ask → Practice → Get feedback → Track progress → Complete → Certificate**

---

## 2. Target users

### Learner

A learner may be:

- a university student
- a job seeker
- an employee
- an intern
- a junior developer
- a client
- any person interested in the company's technical training

Learners can only act on their own enrollments, progress, submissions, quiz attempts, questions, and certificates.

### Instructor

An instructor teaches one or more assigned program batches.

They can:

- manage lesson content for assigned programs if allowed
- create quizzes
- create assignments
- schedule external live sessions
- answer learner questions
- review assignment submissions
- post announcements
- view learner progress

An instructor must not be able to manage unrelated programs or company-wide settings.

### Admin

The admin operates the training platform.

They can:

- manage programs
- manage modules and lessons
- create batches/cohorts
- assign instructors
- manage learners
- manage enrollments
- invite learners to private programs
- view payments
- issue/manage certificates
- see platform analytics

---

## 3. Core terminology

### Program

A reusable training product.

Examples:

- Backend Development Bootcamp
- Frontend Development with React
- Cloud Fundamentals
- AI Fundamentals

A program contains the curriculum.

### Module

A section inside a program.

Example:

**Backend Development**
- Node.js Fundamentals
- REST APIs
- PostgreSQL
- Authentication
- Testing
- Deployment

### Lesson

An individual learning item inside a module.

A V1 lesson supports:

- title
- written content
- external video URL
- code/text examples inside the content
- resource links
- order/position
- published/unpublished state

Do not build video hosting.

### Cohort / Batch

A cohort is simply **one batch of learners taking the same program during the same period**.

Example:

Program:
`Backend Development Bootcamp`

Batches:
- September 2026 Batch
- January 2027 Batch

The program curriculum is reusable. Each batch has its own learners, instructor, dates, live sessions, announcements, and progress.

For the UI, use the word **Batch** if it is clearer.  
The database model may still be named `Cohort`.

---

## 4. Program access types

Every public/private program has exactly one access type.

### FREE

Flow:

`Program → Enroll → Enrollment becomes ACTIVE → Access`

No payment.

### PAID

Flow:

`Program → Checkout → Payment verified → Enrollment becomes ACTIVE → Access`

Important rule:

**Payment and enrollment are separate records.**

A failed or pending payment must never create an active enrollment.

### PRIVATE

Flow:

`Admin sends invitation → Learner accepts invitation → Enrollment becomes ACTIVE → Access`

Private programs are not normally enrollable from the public program catalog.

---

## 5. Enrollment model

V1 supports only:

- Free direct enrollment
- Paid direct enrollment
- Private invitation enrollment

### Explicitly removed from V1

**Application-based enrollment**

Do not create:

- application forms
- acceptance/rejection flows
- application review dashboards
- applicant scoring

This may be added after V1 if the business needs selective programs.

---

## 6. Public program experience

A visitor can:

- view landing page
- browse programs
- search/filter programs
- open program details
- see curriculum summary
- see instructor
- see program level
- see price/access type
- see batch/start information
- register/login
- enroll

Program status should support at least:

- DRAFT
- PUBLISHED
- ARCHIVED

Only published public programs appear in the public catalog.

---

## 7. Online learning experience

All V1 training is **online only**.

The platform manages learning, but does not implement its own live meeting software.

### Live sessions

An instructor/admin can create a session with:

- title
- description
- date/time
- external meeting URL
- optional recording URL after the session
- optional resource URL

The learner sees upcoming sessions and clicks `Join Session`.

---

## 8. Lesson Q&A

V1 includes **lesson-based Q&A**, not realtime chat.

A learner can:

- ask a question under a lesson
- reply to a question
- see instructor answers
- upvote helpful questions/answers

An instructor can:

- answer questions
- mark one answer as accepted

Rules:

- Questions belong to one lesson.
- Only enrolled learners in the related batch/program can post.
- Instructors assigned to that training can answer/manage.
- No direct messages.
- No realtime presence.
- No typing indicators.
- No websocket chat requirement.

---

## 9. Quizzes

Keep quizzes intentionally small in V1.

Supported:

- multiple-choice questions
- one correct answer per question
- configurable pass score
- configurable max attempts
- automatic grading
- result history

Not supported:

- essay questions
- drag-and-drop
- random question banks
- anti-cheat systems
- proctoring
- adaptive tests

---

## 10. Assignments

Assignments are practical work.

An assignment has:

- title
- description
- requirements
- due date
- max score
- related program/batch
- optional related module

V1 learner submission supports:

- project/repository URL
- optional live-demo URL
- optional notes

Instructor review supports:

- score
- written feedback
- reviewed timestamp

Submission statuses:

- NOT_SUBMITTED
- SUBMITTED
- LATE
- REVIEWED

Do not build automated code grading in V1.

---

## 11. Progress tracking

Progress should be understandable.

Track at least:

- lesson completion
- quiz completion/pass state
- assignment completion/review state

V1 overall program progress can use a simple weighted or count-based formula, but it must be deterministic and documented.

Recommended simple V1 formula:

- Lessons: 60%
- Quizzes: 20%
- Assignments: 20%

If a program has no quizzes or assignments, redistribute the unused weight across existing categories.

Keep the calculation in one service/function so it can be changed later.

---

## 12. Announcements and notifications

### Announcements

Instructor/admin can post an announcement to a batch.

Learners see announcements inside the program/dashboard.

### In-app notifications

Create notifications for important events such as:

- payment success
- enrollment created
- private invitation
- new announcement
- new assignment
- assignment reviewed
- quiz graded
- instructor replied to question
- live session created/updated
- certificate issued

No push notification system is required in V1.

Email may be used for high-value events:

- email verification
- password reset
- private invitation
- payment receipt/confirmation
- important enrollment confirmation

---

## 13. Payments

Payment integration is V1.

### Required behavior

- user starts checkout
- create PENDING payment record
- redirect/open payment provider flow
- verify payment using provider-supported verification/webhook
- update payment to SUCCESS/FAILED
- create enrollment only after trusted successful verification
- make enrollment creation idempotent
- store provider reference/transaction ID

Payment statuses:

- PENDING
- SUCCESS
- FAILED
- REFUNDED

### Important implementation rule

Do **not** put provider-specific payment code everywhere.

Create a payment service/provider adapter so the provider can be changed later.

Until the real provider is chosen, use a mock/test provider only in local development.

---

## 14. Certificates

V1 includes a simple certificate system.

Certificate is issued when program completion requirements are met.

Certificate contains:

- learner name
- program name
- issued date
- unique certificate code
- verification URL

Public verification page:

`/certificates/[code]`

Do not build a certificate-template designer.

Use one professional template.

---

## 15. Authentication and authorization

Three roles only:

- ADMIN
- INSTRUCTOR
- LEARNER

Do not let users self-register as admin or instructor.

Admin/instructor accounts are created or invited by an admin.

Authorization must be enforced on the server, not only by hiding UI.

Examples:

- learner cannot edit a program
- learner cannot view another learner's submission
- instructor cannot manage a cohort they are not assigned to
- only admin can view all payments
- only eligible enrolled learners can access protected program content

---

## 16. V1 scope summary

### Included

- public landing page
- public program catalog
- program details
- auth
- three roles
- free/paid/private programs
- direct enrollment
- private invitations
- payment integration
- programs/modules/lessons
- batches/cohorts
- external live sessions
- lesson Q&A
- quizzes
- assignments
- submissions
- instructor reviews
- progress
- announcements
- in-app notifications
- certificates
- basic admin/instructor/learner dashboards

### Explicitly out of scope

Do not build these in V1:

- multi-company SaaS / multi-tenancy
- application-based enrollment
- built-in Zoom/video calls
- video streaming infrastructure
- realtime chat/Discord clone
- direct messages
- AI tutor
- AI grading
- AI course generation
- mobile app
- marketplace for third-party instructors
- public instructor selling accounts
- subscriptions
- multiple payment providers
- advanced accounting
- complex refund workflow
- SCORM/LTI
- gamification/XP/leaderboards
- social feed
- complex forums
- advanced recommendation engine
- advanced analytics/report builder
- file-heavy assignment system
- automated code execution/grading

If a feature is not clearly included above, treat it as out of scope until explicitly approved.
