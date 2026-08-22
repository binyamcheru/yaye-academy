import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("learner can enroll, complete a lesson, and see progress", async ({
  page,
}) => {
  test.setTimeout(45_000);
  const learner = await prisma.user.findUniqueOrThrow({
    where: { email: "learner@example.com" },
  });
  const freeProgram = await prisma.program.findUniqueOrThrow({
    where: { slug: "git-and-github-fundamentals" },
    include: {
      cohorts: { take: 1 },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { where: { isPublished: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
  const paidProgram = await prisma.program.findUniqueOrThrow({
    where: { slug: "backend-development-bootcamp" },
  });

  await prisma.enrollment.deleteMany({
    where: { userId: learner.id, cohort: { programId: freeProgram.id } },
  });

  try {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("learner@example.com");
    await page.getByLabel("Password").fill("Learner1234!");
    await page.getByRole("button", { name: "Enter workspace" }).click();
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/programs/git-and-github-fundamentals");
    await page
      .getByRole("button", { name: "Enroll in this free program" })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/programs/${freeProgram.id}$`),
    );
    await expect(
      page.getByRole("heading", { name: "Git & GitHub Fundamentals" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Open curriculum" }).click();
    const firstLesson = freeProgram.modules[0]?.lessons[0];
    expect(firstLesson).toBeDefined();
    await page.getByRole("link", { name: firstLesson!.title }).click();
    await page.getByRole("button", { name: "Mark lesson complete" }).click();
    await expect(
      page.getByText(/Lesson complete · 33% program progress/),
    ).toBeVisible();

    await page.goto(`/dashboard/programs/${freeProgram.id}`);
    await expect(
      page.getByRole("progressbar", { name: "Program progress" }),
    ).toHaveAttribute("aria-valuenow", "33");

    await page.goto("/dashboard");
    await expect(page.getByText("Git & GitHub Fundamentals")).toBeVisible();
    await expect(page.getByText("1 of 3 lessons complete")).toBeVisible();

    await page.goto("/programs/git-and-github-fundamentals");
    await expect(
      page.getByRole("link", { name: "Open this program" }),
    ).toBeVisible();

    const forbiddenResponse = await page.goto(
      `/dashboard/programs/${paidProgram.id}`,
    );
    expect(forbiddenResponse?.status()).toBe(404);
  } finally {
    await prisma.enrollment.deleteMany({
      where: { userId: learner.id, cohort: { programId: freeProgram.id } },
    });
  }
});
