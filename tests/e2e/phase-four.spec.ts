import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

async function login(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  const roleHome = email === "admin@example.com" ? "/admin" : "/dashboard";
  await Promise.all([
    page.waitForURL(new RegExp(`${roleHome}$`)),
    page.getByRole("button", { name: "Enter workspace" }).click(),
  ]);
}

test("admin invitation is restricted to the intended learner and single use", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const privateProgram = await prisma.program.findUniqueOrThrow({
    where: { slug: "internal-security-training" },
    include: { cohorts: { take: 1 } },
  });
  const cohort = privateProgram.cohorts[0];
  if (!cohort) throw new Error("Private-program seed batch is missing.");
  const sara = await prisma.user.findUniqueOrThrow({
    where: { email: "sara@example.com" },
  });

  await prisma.privateInvitation.deleteMany({
    where: { cohortId: cohort.id, email: sara.email },
  });
  await prisma.enrollment.deleteMany({
    where: { cohortId: cohort.id, userId: sara.id },
  });

  try {
    await login(page, "admin@example.com", "Admin1234!");
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/enrollments");
    await page.getByLabel("Private batch").selectOption(cohort.id);
    await page.getByLabel("Learner email").fill("  SARA@EXAMPLE.COM ");
    await page.getByRole("button", { name: "Create invitation" }).click();

    const invitationLink = page.getByRole("link", {
      name: /\/invitations\//,
    });
    await expect(invitationLink).toBeVisible();
    const invitationUrl = await invitationLink.getAttribute("href");
    expect(invitationUrl).toBeTruthy();
    await expect(
      page.getByText("sara@example.com", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("PENDING", { exact: true })).toBeVisible();

    const storedInvitation = await prisma.privateInvitation.findFirstOrThrow({
      where: { cohortId: cohort.id, email: sara.email },
    });
    expect(storedInvitation.tokenHash).toHaveLength(64);
    expect(invitationUrl).not.toContain(storedInvitation.tokenHash);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Log out" }).click();
    await login(page, "learner@example.com", "Learner1234!");
    await page.goto(invitationUrl!);
    await page.getByRole("button", { name: "Accept invitation" }).click();
    await expect(
      page.getByText(/This invitation is intended for sara@example.com/),
    ).toBeVisible();
    await expect(
      prisma.enrollment.count({
        where: { cohortId: cohort.id, userId: sara.id },
      }),
    ).resolves.toBe(0);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Log out" }).click();
    await login(page, "sara@example.com", "SaraLearner1234!");
    await page.goto(invitationUrl!);
    await page.getByRole("button", { name: "Accept invitation" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/programs/${privateProgram.id}$`),
    );
    await expect(
      page.getByRole("heading", { name: "Internal Security Training" }),
    ).toBeVisible();
    await expect(
      prisma.enrollment.count({
        where: { cohortId: cohort.id, userId: sara.id },
      }),
    ).resolves.toBe(1);

    await page.goto(invitationUrl!);
    await expect(page.getByText("ACCEPTED", { exact: true })).toBeVisible();
    await expect(
      page.getByText("This invitation has already been accepted."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Accept invitation" }),
    ).toHaveCount(0);
  } finally {
    await prisma.enrollment.deleteMany({
      where: { cohortId: cohort.id, userId: sara.id },
    });
    await prisma.privateInvitation.deleteMany({
      where: { cohortId: cohort.id, email: sara.email },
    });
  }
});

test("private programs still reject direct public enrollment", async ({
  page,
}) => {
  await page.goto("/programs");
  await expect(page.getByText("Internal Security Training")).toHaveCount(0);
  const response = await page.goto("/programs/internal-security-training");
  expect(response?.status()).toBe(404);
});
