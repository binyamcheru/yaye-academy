import "dotenv/config";

import { randomUUID } from "node:crypto";

import { PrismaClient, UserRole } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

test.afterAll(async () => prisma.$disconnect());

async function createCredentialUser(role: UserRole, suffix: string) {
  const id = randomUUID();
  const email = `${role.toLowerCase()}-${suffix}@example.com`;
  const password = "Phase6Boundary1234!";
  await prisma.user.create({
    data: {
      id,
      name: `Phase 6 ${role}`,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: randomUUID(),
          issuer: "local:credential",
          accountId: id,
          providerId: "credential",
          password: await hashPassword(password),
        },
      },
    },
  });
  return { id, email, password };
}

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  home: "/dashboard" | "/instructor",
) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await Promise.all([
    page.waitForURL(new RegExp(`${home}$`)),
    page.getByRole("button", { name: "Enter workspace" }).click(),
  ]);
}

test("assigned instructor publishes cohort communication visible only to enrolled learners", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}`;
  const sessionTitle = `API clinic ${suffix}`;
  const announcementTitle = `Preparation note ${suffix}`;
  const program = await prisma.program.findUniqueOrThrow({
    where: { slug: "git-and-github-fundamentals" },
    include: { cohorts: { take: 1 } },
  });
  const cohort = program.cohorts[0];
  if (!cohort) throw new Error("Free-program seed batch is missing.");
  const sara = await prisma.user.findUniqueOrThrow({
    where: { email: "sara@example.com" },
  });
  const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

  await prisma.notification.deleteMany({
    where: { userId: sara.id, title: { contains: suffix } },
  });

  try {
    await login(
      page,
      "instructor@example.com",
      "Instructor1234!",
      "/instructor",
    );
    await page.goto(`/instructor/programs/${program.id}/sessions/new`);
    await page.getByLabel("Batch").selectOption(cohort.id);
    await page.getByLabel("Session title").fill(sessionTitle);
    await page
      .getByLabel("Description (optional)")
      .fill("Bring your current API resource map for a focused design review.");
    await page.getByLabel("Starts").fill(startsAt.toISOString().slice(0, 16));
    await page
      .getByLabel("Ends (optional)")
      .fill(endsAt.toISOString().slice(0, 16));
    await page
      .getByLabel("Meet or Zoom URL")
      .fill("https://meet.google.com/abc-defg-hij");
    await page
      .getByLabel("Slides URL (optional)")
      .fill("https://example.com/api-clinic-slides");
    await page.getByRole("button", { name: "Publish session" }).click();
    await expect(page).toHaveURL(
      new RegExp(
        `/instructor/programs/${program.id}/sessions\\?created=session$`,
      ),
    );
    await expect(
      page.getByRole("heading", { name: sessionTitle }),
    ).toBeVisible();

    await page.goto(`/instructor/programs/${program.id}/announcements/new`);
    await page.getByLabel("Batch").selectOption(cohort.id);
    await page.getByLabel("Announcement title").fill(announcementTitle);
    await page
      .getByLabel("Message")
      .fill(
        "Review the first module and bring one question to the API clinic.",
      );
    await page.getByRole("button", { name: "Publish announcement" }).click();
    await expect(page).toHaveURL(
      new RegExp(
        `/instructor/programs/${program.id}/announcements\\?created=announcement$`,
      ),
    );
    await expect(
      page.getByRole("heading", { name: announcementTitle }),
    ).toBeVisible();

    await context.clearCookies();
    await login(page, "sara@example.com", "SaraLearner1234!", "/dashboard");
    await expect(page.getByText(sessionTitle, { exact: true })).toBeVisible();
    await expect(
      page.getByText(announcementTitle, { exact: true }),
    ).toBeVisible();
    await page.goto(`/dashboard/programs/${program.id}/sessions`);
    await expect(
      page.getByRole("heading", { name: sessionTitle }),
    ).toBeVisible();
    const learnerSession = page
      .getByRole("article")
      .filter({ hasText: sessionTitle });
    await expect(
      learnerSession.getByRole("link", { name: "Join session ↗" }),
    ).toHaveAttribute("href", "https://meet.google.com/abc-defg-hij");
    await page.goto(`/dashboard/programs/${program.id}`);
    await expect(
      page.getByRole("heading", { name: announcementTitle }),
    ).toBeVisible();
    await page.goto("/dashboard/notifications");
    const sessionNotification = page
      .getByRole("article")
      .filter({ hasText: `New live session: ${sessionTitle}` });
    await expect(
      sessionNotification.getByText("Unread", { exact: true }),
    ).toBeVisible();
    await sessionNotification
      .getByRole("button", { name: "Mark as read" })
      .click();
    await expect(
      sessionNotification.getByRole("button", { name: "Mark as read" }),
    ).toHaveCount(0);
  } finally {
    await prisma.notification.deleteMany({
      where: { userId: sara.id, title: { contains: suffix } },
    });
    await prisma.announcement.deleteMany({
      where: { cohortId: cohort.id, title: announcementTitle },
    });
    await prisma.liveSession.deleteMany({
      where: { cohortId: cohort.id, title: sessionTitle },
    });
  }
});

test("unrelated instructors and unenrolled learners cannot read cohort communication", async ({
  context,
  page,
}) => {
  test.setTimeout(60_000);
  const suffix = `${Date.now()}`;
  const program = await prisma.program.findUniqueOrThrow({
    where: { slug: "git-and-github-fundamentals" },
  });
  const unrelatedInstructor = await createCredentialUser(
    UserRole.INSTRUCTOR,
    suffix,
  );
  const unenrolledLearner = await createCredentialUser(
    UserRole.LEARNER,
    suffix,
  );

  try {
    await login(
      page,
      unenrolledLearner.email,
      unenrolledLearner.password,
      "/dashboard",
    );
    expect(
      (await page.goto(`/dashboard/programs/${program.id}/sessions`))?.status(),
    ).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Live sessions" }),
    ).toHaveCount(0);

    await context.clearCookies();
    await login(
      page,
      unrelatedInstructor.email,
      unrelatedInstructor.password,
      "/instructor",
    );
    expect(
      (
        await page.goto(`/instructor/programs/${program.id}/sessions/new`)
      )?.status(),
    ).toBe(404);
    await expect(page.getByLabel("Session title")).toHaveCount(0);
  } finally {
    await prisma.user.deleteMany({
      where: { id: { in: [unrelatedInstructor.id, unenrolledLearner.id] } },
    });
  }
});
