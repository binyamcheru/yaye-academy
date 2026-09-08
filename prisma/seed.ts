import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import {
  CohortStatus,
  EnrollmentStatus,
  NotificationType,
  PrismaClient,
  ProgramAccessType,
  ProgramLevel,
  ProgramStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const demoUsers = [
  {
    name: "Yaye Academy Admin",
    email: "admin@example.com",
    password: "Admin1234!",
    role: UserRole.ADMIN,
  },
  {
    name: "Yaye Academy Instructor",
    email: "instructor@example.com",
    password: "Instructor1234!",
    role: UserRole.INSTRUCTOR,
  },
  {
    name: "Yaye Academy Learner",
    email: "learner@example.com",
    password: "Learner1234!",
    role: UserRole.LEARNER,
  },
  {
    name: "Sara Alemu",
    email: "sara@example.com",
    password: "SaraLearner1234!",
    role: UserRole.LEARNER,
  },
] as const;

const demoPrograms = [
  {
    title: "Backend Development Bootcamp",
    slug: "backend-development-bootcamp",
    shortDescription:
      "Build production-minded APIs with Node.js, PostgreSQL, authentication, testing, and deployment.",
    description:
      "A structured backend engineering pathway centered on practical API development. Learners move from Node.js foundations through relational data, authentication, testing, and deployment while producing work that can be reviewed.",
    level: ProgramLevel.INTERMEDIATE,
    accessType: ProgramAccessType.PAID,
    price: 4000,
    durationWeeks: 12,
    status: ProgramStatus.PUBLISHED,
    learningOutcomes: [
      "Design and build REST APIs with Node.js",
      "Model relational data with PostgreSQL",
      "Implement authentication and authorization",
      "Test and deploy a backend service",
    ],
    requirements: [
      "Basic JavaScript knowledge",
      "A computer capable of running Node.js and PostgreSQL",
      "Time for weekly lessons, live sessions, and practical work",
    ],
    modules: [
      {
        title: "Node.js Foundations",
        description: "Runtime fundamentals and dependable project structure.",
        lessons: [
          {
            title: "How the Node.js runtime works",
            content:
              "Understand the runtime, modules, asynchronous work, and the foundations used throughout the program.",
          },
          {
            title: "Structuring a backend project",
            content:
              "Organize application concerns so routes, services, validation, and persistence remain understandable.",
          },
        ],
      },
      {
        title: "REST APIs and PostgreSQL",
        description: "HTTP interfaces backed by relational data.",
        lessons: [
          {
            title: "Designing REST resources",
            content:
              "Turn product requirements into clear resources, endpoints, status codes, and validation rules.",
          },
          {
            title: "Relational data modeling",
            content:
              "Design tables, constraints, and relationships that protect data integrity.",
          },
        ],
      },
      {
        title: "Authentication, Testing, and Deployment",
        description: "Protect, verify, and ship the service.",
        lessons: [
          {
            title: "Authentication and role boundaries",
            content:
              "Implement secure account access and enforce authorization on the server.",
          },
          {
            title: "Testing and deployment readiness",
            content:
              "Build a verification strategy and prepare the application for a production environment.",
          },
        ],
      },
    ],
    cohort: {
      name: "September 2026 Batch",
      startDate: new Date("2026-09-07T15:00:00.000Z"),
      endDate: new Date("2026-11-30T15:00:00.000Z"),
      capacity: 32,
      status: CohortStatus.UPCOMING,
    },
  },
  {
    title: "Git & GitHub Fundamentals",
    slug: "git-and-github-fundamentals",
    shortDescription:
      "Learn a dependable version-control workflow for projects and collaborative engineering teams.",
    description:
      "A focused introduction to Git and GitHub that moves from local version control to branches, pull requests, code review, and healthy collaboration habits.",
    level: ProgramLevel.BEGINNER,
    accessType: ProgramAccessType.FREE,
    price: null,
    durationWeeks: 3,
    status: ProgramStatus.PUBLISHED,
    learningOutcomes: [
      "Track project history confidently with Git",
      "Work safely with branches and merges",
      "Collaborate through GitHub pull requests",
    ],
    requirements: [
      "A computer with Git installed",
      "No prior Git experience required",
    ],
    modules: [
      {
        title: "Version Control Foundations",
        description: "The mental model and essential local workflow.",
        lessons: [
          {
            title: "Repositories, commits, and history",
            content:
              "Create a repository, stage focused changes, write useful commits, and inspect project history.",
          },
          {
            title: "Branches and merging",
            content:
              "Use branches to isolate work and merge changes with a clear understanding of conflicts.",
          },
        ],
      },
      {
        title: "Collaboration on GitHub",
        description: "Remote repositories and reviewable teamwork.",
        lessons: [
          {
            title: "Pull requests and code review",
            content:
              "Open a focused pull request, explain changes, respond to review, and merge responsibly.",
          },
        ],
      },
    ],
    cohort: {
      name: "October 2026 Batch",
      startDate: new Date("2026-10-05T15:00:00.000Z"),
      endDate: new Date("2026-10-26T15:00:00.000Z"),
      capacity: 40,
      status: CohortStatus.UPCOMING,
    },
  },
  {
    title: "Internal Security Training",
    slug: "internal-security-training",
    shortDescription:
      "Company-focused training for safer development habits, access practices, and security awareness.",
    description:
      "A private program for Yaye Tech teams covering account hygiene, secure handling of company information, and practical incident awareness.",
    level: ProgramLevel.BEGINNER,
    accessType: ProgramAccessType.PRIVATE,
    price: null,
    durationWeeks: 2,
    status: ProgramStatus.PUBLISHED,
    learningOutcomes: [
      "Apply safer account and credential practices",
      "Recognize common social-engineering risks",
      "Respond appropriately to suspected incidents",
    ],
    requirements: ["Invitation from an administrator"],
    modules: [
      {
        title: "Everyday Security Practice",
        description:
          "Small habits that protect company systems and information.",
        lessons: [
          {
            title: "Credentials and account access",
            content:
              "Use strong authentication habits and recognize unsafe credential handling.",
          },
          {
            title: "Reporting suspicious activity",
            content:
              "Recognize warning signs and follow a clear internal reporting path.",
          },
        ],
      },
    ],
    cohort: {
      name: "Yaye Tech Staff Batch",
      startDate: new Date("2026-09-14T15:00:00.000Z"),
      endDate: new Date("2026-09-28T15:00:00.000Z"),
      capacity: 25,
      status: CohortStatus.UPCOMING,
    },
  },
] as const;

async function upsertDemoUser(demoUser: (typeof demoUsers)[number]) {
  const password = await hashPassword(demoUser.password);

  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.upsert({
      where: { email: demoUser.email },
      update: {
        emailVerified: true,
        name: demoUser.name,
        role: demoUser.role,
      },
      create: {
        id: randomUUID(),
        email: demoUser.email,
        emailVerified: true,
        name: demoUser.name,
        role: demoUser.role,
      },
    });

    await transaction.account.upsert({
      where: {
        issuer_accountId: {
          issuer: "local:credential",
          accountId: user.id,
        },
      },
      update: { password },
      create: {
        id: randomUUID(),
        issuer: "local:credential",
        accountId: user.id,
        providerId: "credential",
        password,
        userId: user.id,
      },
    });

    return user;
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function upsertDemoProgram(
  demoProgram: (typeof demoPrograms)[number],
  adminId: string,
  instructorId: string,
) {
  const program = await prisma.program.upsert({
    where: { slug: demoProgram.slug },
    update: {
      title: demoProgram.title,
      shortDescription: demoProgram.shortDescription,
      description: demoProgram.description,
      level: demoProgram.level,
      accessType: demoProgram.accessType,
      price: demoProgram.price,
      durationWeeks: demoProgram.durationWeeks,
      learningOutcomes: [...demoProgram.learningOutcomes],
      requirements: [...demoProgram.requirements],
      status: demoProgram.status,
      createdById: adminId,
    },
    create: {
      title: demoProgram.title,
      slug: demoProgram.slug,
      shortDescription: demoProgram.shortDescription,
      description: demoProgram.description,
      level: demoProgram.level,
      accessType: demoProgram.accessType,
      price: demoProgram.price,
      durationWeeks: demoProgram.durationWeeks,
      learningOutcomes: [...demoProgram.learningOutcomes],
      requirements: [...demoProgram.requirements],
      status: demoProgram.status,
      createdById: adminId,
    },
  });

  for (const [moduleIndex, demoModule] of demoProgram.modules.entries()) {
    const moduleOrder = moduleIndex + 1;
    const moduleRecord = await prisma.module.upsert({
      where: {
        programId_order: { programId: program.id, order: moduleOrder },
      },
      update: {
        title: demoModule.title,
        description: demoModule.description,
      },
      create: {
        programId: program.id,
        title: demoModule.title,
        description: demoModule.description,
        order: moduleOrder,
      },
    });

    for (const [lessonIndex, demoLesson] of demoModule.lessons.entries()) {
      const lessonOrder = lessonIndex + 1;
      await prisma.lesson.upsert({
        where: {
          moduleId_order: {
            moduleId: moduleRecord.id,
            order: lessonOrder,
          },
        },
        update: {
          title: demoLesson.title,
          slug: slugify(demoLesson.title),
          content: demoLesson.content,
          isPublished: true,
        },
        create: {
          moduleId: moduleRecord.id,
          title: demoLesson.title,
          slug: slugify(demoLesson.title),
          content: demoLesson.content,
          order: lessonOrder,
          isPublished: true,
        },
      });
    }
  }

  const cohort = await prisma.cohort.upsert({
    where: {
      programId_name: {
        programId: program.id,
        name: demoProgram.cohort.name,
      },
    },
    update: {
      instructorId,
      startDate: demoProgram.cohort.startDate,
      endDate: demoProgram.cohort.endDate,
      capacity: demoProgram.cohort.capacity,
      status: demoProgram.cohort.status,
    },
    create: {
      programId: program.id,
      instructorId,
      name: demoProgram.cohort.name,
      startDate: demoProgram.cohort.startDate,
      endDate: demoProgram.cohort.endDate,
      capacity: demoProgram.cohort.capacity,
      status: demoProgram.cohort.status,
    },
  });

  const sessionStartsAt = new Date(
    demoProgram.cohort.startDate.getTime() + 2 * 24 * 60 * 60 * 1000,
  );
  const sessionEndsAt = new Date(sessionStartsAt.getTime() + 90 * 60 * 1000);
  await prisma.liveSession.upsert({
    where: { id: `seed-session-${demoProgram.slug}` },
    update: {
      cohortId: cohort.id,
      title: "Batch orientation and learning workflow",
      description:
        "Meet the instructor, review the weekly rhythm, and prepare the tools used throughout the program.",
      startsAt: sessionStartsAt,
      endsAt: sessionEndsAt,
      meetingUrl: "https://meet.example.com/yaye-academy-preview",
      resourceUrl: "https://example.com/yaye-academy/session-resources",
      createdById: instructorId,
    },
    create: {
      id: `seed-session-${demoProgram.slug}`,
      cohortId: cohort.id,
      title: "Batch orientation and learning workflow",
      description:
        "Meet the instructor, review the weekly rhythm, and prepare the tools used throughout the program.",
      startsAt: sessionStartsAt,
      endsAt: sessionEndsAt,
      meetingUrl: "https://meet.example.com/yaye-academy-preview",
      resourceUrl: "https://example.com/yaye-academy/session-resources",
      createdById: instructorId,
    },
  });

  await prisma.announcement.upsert({
    where: { id: `seed-announcement-${demoProgram.slug}` },
    update: {
      cohortId: cohort.id,
      authorId: instructorId,
      title: "Welcome to your batch workspace",
      body: "Your curriculum and batch schedule are ready. Review the first module before the orientation session and bring any setup questions.",
    },
    create: {
      id: `seed-announcement-${demoProgram.slug}`,
      cohortId: cohort.id,
      authorId: instructorId,
      title: "Welcome to your batch workspace",
      body: "Your curriculum and batch schedule are ready. Review the first module before the orientation session and bring any setup questions.",
    },
  });

  console.log(`Seeded program: ${program.title}`);
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo accounts must not be seeded in production.");
  }

  const users = new Map<string, Awaited<ReturnType<typeof upsertDemoUser>>>();

  for (const demoUser of demoUsers) {
    const user = await upsertDemoUser(demoUser);
    users.set(user.email, user);
    console.log(`Seeded ${user.role.toLowerCase()}: ${user.email}`);
  }

  const admin = users.get("admin@example.com");
  const instructor = users.get("instructor@example.com");

  if (!admin || !instructor) {
    throw new Error("Required seed users were not created.");
  }

  for (const demoProgram of demoPrograms) {
    await upsertDemoProgram(demoProgram, admin.id, instructor.id);
  }

  const sara = users.get("sara@example.com");
  const gitBatch = await prisma.cohort.findFirst({
    where: { program: { slug: "git-and-github-fundamentals" } },
    select: { id: true, programId: true },
  });

  if (!sara || !gitBatch) {
    throw new Error("Required learner or free-program batch was not created.");
  }

  await prisma.enrollment.upsert({
    where: {
      userId_cohortId: { userId: sara.id, cohortId: gitBatch.id },
    },
    update: { status: EnrollmentStatus.ACTIVE, completedAt: null },
    create: {
      userId: sara.id,
      cohortId: gitBatch.id,
      status: EnrollmentStatus.ACTIVE,
    },
  });
  console.log(
    "Seeded enrollment: sara@example.com → Git & GitHub Fundamentals",
  );

  await prisma.notification.upsert({
    where: { id: "seed-notification-git-session-sara" },
    update: {
      userId: sara.id,
      type: NotificationType.LIVE_SESSION_CREATED,
      title: "New live session: Batch orientation and learning workflow",
      body: "Git & GitHub Fundamentals · October 2026 Batch",
      href: `/dashboard/programs/${gitBatch.programId}/sessions`,
      readAt: null,
    },
    create: {
      id: "seed-notification-git-session-sara",
      userId: sara.id,
      type: NotificationType.LIVE_SESSION_CREATED,
      title: "New live session: Batch orientation and learning workflow",
      body: "Git & GitHub Fundamentals · October 2026 Batch",
      href: `/dashboard/programs/${gitBatch.programId}/sessions`,
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
