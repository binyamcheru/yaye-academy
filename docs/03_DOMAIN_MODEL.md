# 03 — Domain Model and Database Plan

This is a conceptual Prisma/PostgreSQL model, not a final schema.  
Codex should implement it carefully in stages.

---

# 1. User

Core fields:

- id
- name
- email (unique)
- passwordHash / auth-provider fields
- role: ADMIN | INSTRUCTOR | LEARNER
- avatarUrl (optional)
- bio (optional)
- githubUrl (optional)
- portfolioUrl (optional)
- emailVerifiedAt (optional)
- createdAt
- updatedAt

---

# 2. Program

Represents a reusable training program.

Fields:

- id
- title
- slug (unique)
- shortDescription
- description
- thumbnailUrl (optional)
- level: BEGINNER | INTERMEDIATE | ADVANCED
- accessType: FREE | PAID | PRIVATE
- price (nullable for free/private)
- currency (default ETB)
- status: DRAFT | PUBLISHED | ARCHIVED
- createdById
- createdAt
- updatedAt

Relationships:

- Program has many Modules
- Program has many Cohorts/Batches
- Program may have Certificates
- Program may have Payments

---

# 3. Module

Fields:

- id
- programId
- title
- description (optional)
- order
- createdAt
- updatedAt

Constraints:

- unique `(programId, order)` if practical

Relationship:

- Module belongs to Program
- Module has many Lessons

---

# 4. Lesson

Fields:

- id
- moduleId
- title
- slug or stable identifier
- content
- videoUrl (optional)
- order
- isPublished
- createdAt
- updatedAt

Relationships:

- Lesson belongs to Module
- Lesson has many LessonProgress records
- Lesson has many Questions

Resource links can be stored either:
- in a simple JSON field for V1, or
- in a separate `LessonResource` table

Prefer separate table if resources need independent CRUD.

---

# 5. Cohort / Batch

Use `Cohort` in database if desired.  
Use **Batch** in UI if clearer.

Fields:

- id
- programId
- name
- startDate
- endDate
- capacity (optional)
- status: UPCOMING | ACTIVE | COMPLETED | CANCELLED
- createdAt
- updatedAt

Relationships:

- Cohort belongs to Program
- Cohort has instructors
- Cohort has Enrollments
- Cohort has LiveSessions
- Cohort has Assignments
- Cohort has Announcements

For V1, if one cohort has only one main instructor, a direct `instructorId` is acceptable.  
If multiple instructors are required, use a join table.

---

# 6. Enrollment

Fields:

- id
- userId
- cohortId
- status: ACTIVE | COMPLETED | CANCELLED
- enrolledAt
- completedAt (optional)
- createdAt
- updatedAt

Critical constraint:

`unique(userId, cohortId)`

This prevents duplicate enrollment.

Enrollment is the main authorization link proving a learner can access a cohort.

---

# 7. PrivateInvitation

Fields:

- id
- cohortId
- email
- tokenHash
- expiresAt
- acceptedAt (optional)
- invitedById
- createdAt

Flow:

`Invitation → acceptance → Enrollment`

Invitation must be single-use.

---

# 8. Payment

Fields:

- id
- userId
- programId or cohortId
- amount
- currency
- provider
- providerReference (optional unique)
- status: PENDING | SUCCESS | FAILED | REFUNDED
- paidAt (optional)
- metadata JSON (optional)
- createdAt
- updatedAt

Important:

Payment success should create enrollment in an idempotent transaction/service flow.

Do not assume client-side redirect means payment succeeded.

---

# 9. LessonProgress

Fields:

- id
- userId
- lessonId
- completedAt
- createdAt

Critical constraint:

`unique(userId, lessonId)`

Before marking complete, verify learner has an active enrollment for the related cohort/program.

If progress must vary by cohort, add `enrollmentId` and use that as the ownership link.

---

# 10. Quiz

Fields:

- id
- cohortId or programId
- moduleId (optional)
- title
- description
- passScore
- maxAttempts
- isPublished
- createdAt
- updatedAt

V1 choice:

Prefer associating quizzes to a **cohort** if deadlines/availability differ by batch.

---

# 11. QuizQuestion

Fields:

- id
- quizId
- text
- order

---

# 12. QuizChoice

Fields:

- id
- questionId
- text
- isCorrect
- order

Security rule:

Do not send `isCorrect` to the learner before quiz submission.

---

# 13. QuizAttempt

Fields:

- id
- quizId
- userId
- attemptNumber
- score
- passed
- startedAt
- submittedAt

Recommended:
Store learner responses in `QuizResponse`.

---

# 14. QuizResponse

Fields:

- id
- attemptId
- questionId
- selectedChoiceId
- isCorrect

---

# 15. Assignment

Fields:

- id
- cohortId
- moduleId (optional)
- title
- description
- requirements
- dueDate
- maxScore
- isPublished
- createdById
- createdAt
- updatedAt

---

# 16. Submission

Fields:

- id
- assignmentId
- learnerId
- repositoryUrl
- demoUrl (optional)
- notes (optional)
- status: SUBMITTED | LATE | REVIEWED
- submittedAt
- score (optional)
- feedback (optional)
- reviewedById (optional)
- reviewedAt (optional)
- createdAt
- updatedAt

Recommended constraint:

`unique(assignmentId, learnerId)`

For V1, use one active submission per learner per assignment.

---

# 17. Question

Lesson Q&A question.

Fields:

- id
- lessonId
- authorId
- title
- body
- createdAt
- updatedAt

---

# 18. Answer

Fields:

- id
- questionId
- authorId
- body
- isAccepted
- createdAt
- updatedAt

Rule:

Only one answer per question may be accepted.

---

# 19. Vote

Optional but useful.

Fields:

- id
- userId
- questionId (nullable)
- answerId (nullable)
- createdAt

Constraint:
One vote per user per target.

If votes create too much work, this can be postponed without removing Q&A.

---

# 20. LiveSession

Fields:

- id
- cohortId
- title
- description (optional)
- startsAt
- endsAt (optional)
- meetingUrl
- recordingUrl (optional)
- resourceUrl (optional)
- createdById
- createdAt
- updatedAt

---

# 21. Announcement

Fields:

- id
- cohortId
- authorId
- title
- body
- createdAt
- updatedAt

---

# 22. Notification

Fields:

- id
- userId
- type
- title
- body
- href (optional)
- readAt (optional)
- createdAt

Keep notification types as an enum if manageable.

---

# 23. Certificate

Fields:

- id
- enrollmentId
- code (unique)
- issuedAt
- revokedAt (optional)
- createdAt

Certificate info can derive learner/program data through enrollment.

Public verification must not expose private learner data beyond what the certificate intentionally displays.

---

# 24. Suggested relationship picture

```text
User
├── Enrollment ── Cohort ── Program
│                    │          │
│                    │          └── Module ── Lesson ── Question ── Answer
│                    │
│                    ├── Assignment ── Submission
│                    ├── Quiz ── QuizAttempt
│                    ├── LiveSession
│                    └── Announcement
│
├── Payment
├── Notification
└── Certificate (through Enrollment)
```

---

# 25. Database rules that matter

Use PostgreSQL constraints where possible.

Important examples:

- unique email
- unique program slug
- unique learner/cohort enrollment
- unique learner/lesson progress
- unique learner/assignment submission
- unique certificate code
- foreign keys on all relationships
- transaction for payment-success + enrollment creation
- indexes for frequently filtered foreign keys/status/date fields

Do not rely only on UI validation.

---

# 26. Recommended Prisma enums

Potential enums:

- UserRole
- ProgramLevel
- ProgramAccessType
- ProgramStatus
- CohortStatus
- EnrollmentStatus
- PaymentStatus
- SubmissionStatus
- NotificationType

Keep enums small and business-focused.
