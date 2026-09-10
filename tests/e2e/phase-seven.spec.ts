import "dotenv/config";

import { randomUUID } from "node:crypto";

import { PrismaClient, UserRole } from "@prisma/client";
import { expect, test } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

test.afterAll(async () => prisma.$disconnect());

async function createCredentialUser(role: UserRole, suffix: string) {
  const id = randomUUID();
  const email = `phase7-${role.toLowerCase()}-${suffix}@example.com`;
  const password = "Phase7Boundary1234!";
  await prisma.user.create({
    data: {
      id,
      name: `Phase 7 ${role}`,
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

test("enrolled learner asks and answers while assigned instructor accepts exactly one answer", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);
  const suffix = `${Date.now()}`;
  const questionTitle = `How should API boundaries be tested ${suffix}?`;
  const learnerAnswer = `I started by testing the service boundary ${suffix}.`;
  const instructorAnswer = `Test authorization at the server action and service layers ${suffix}.`;
  const sara = await prisma.user.findUniqueOrThrow({
    where: { email: "sara@example.com" },
  });
  const program = await prisma.program.findUniqueOrThrow({
    where: { slug: "git-and-github-fundamentals" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { where: { isPublished: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
  const lesson = program.modules[0]?.lessons[0];
  if (!lesson) throw new Error("Published seed lesson is missing.");
  const unrelatedInstructor = await createCredentialUser(
    UserRole.INSTRUCTOR,
    suffix,
  );
  const unenrolledLearner = await createCredentialUser(
    UserRole.LEARNER,
    suffix,
  );
  let questionId: string | undefined;

  try {
    await login(page, "sara@example.com", "SaraLearner1234!", "/dashboard");
    await page.goto(`/dashboard/programs/${program.id}/lessons/${lesson.id}`);
    await page.getByText("Ask a question", { exact: true }).click();
    await page.getByLabel("Question title").fill(questionTitle);
    await page
      .getByLabel("Details")
      .fill(
        "I understand the happy path, but I need help deciding where authorization boundary tests belong.",
      );
    await page.getByRole("button", { name: "Ask question" }).click();
    await expect(page).toHaveURL(/\/dashboard\/questions\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: questionTitle }),
    ).toBeVisible();
    questionId = page.url().split("/").at(-1);
    expect(questionId).toBeTruthy();

    await page.getByLabel("Your answer").fill(learnerAnswer);
    await page.getByRole("button", { name: "Publish answer" }).click();
    await expect(page.getByText(learnerAnswer, { exact: true })).toBeVisible();

    await context.clearCookies();
    await login(
      page,
      unrelatedInstructor.email,
      unrelatedInstructor.password,
      "/instructor",
    );
    await page.goto("/instructor/questions");
    await expect(page.getByText(questionTitle, { exact: true })).toHaveCount(0);

    await context.clearCookies();
    await login(
      page,
      unenrolledLearner.email,
      unenrolledLearner.password,
      "/dashboard",
    );
    expect(
      (await page.goto(`/dashboard/questions/${questionId}`))?.status(),
    ).toBe(404);

    await context.clearCookies();
    await login(
      page,
      "instructor@example.com",
      "Instructor1234!",
      "/instructor",
    );
    await page.goto("/instructor/questions");
    const questionPanel = page
      .getByRole("article")
      .filter({ hasText: questionTitle });
    await expect(questionPanel).toBeVisible();
    await expect(questionPanel.getByText("Needs instructor")).toBeVisible();
    await questionPanel
      .getByText("Add instructor answer", { exact: true })
      .click();
    await questionPanel.getByLabel("Your answer").fill(instructorAnswer);
    await questionPanel.getByRole("button", { name: "Publish answer" }).click();
    await expect(
      questionPanel.getByText(instructorAnswer, { exact: true }),
    ).toBeVisible();
    await questionPanel
      .getByRole("button", { name: "Accept answer" })
      .first()
      .click();
    await expect(
      questionPanel.getByText("Accepted answer", { exact: true }),
    ).toBeVisible();
    await expect(
      prisma.answer.count({ where: { questionId, isAccepted: true } }),
    ).resolves.toBe(1);

    await context.clearCookies();
    await login(page, "sara@example.com", "SaraLearner1234!", "/dashboard");
    await page.goto(`/dashboard/questions/${questionId}`);
    await expect(
      page.getByText(instructorAnswer, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Accepted answer", { exact: true }),
    ).toBeVisible();
    await page.goto("/dashboard/notifications");
    await expect(
      page.getByText("Your lesson question has a new answer", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("An answer was accepted", { exact: true }),
    ).toBeVisible();
  } finally {
    if (questionId) {
      await prisma.notification.deleteMany({
        where: { userId: sara.id, href: `/dashboard/questions/${questionId}` },
      });
      await prisma.question.deleteMany({ where: { id: questionId } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [unrelatedInstructor.id, unenrolledLearner.id] } },
    });
  }
});
