import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const prisma = new PrismaClient();

test.afterAll(async () => prisma.$disconnect());

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("learner@example.com");
  await page.getByLabel("Password").fill("Learner1234!");
  await page.getByRole("button", { name: "Enter workspace" }).click();
}

test("verified Chapa success enrolls once and failed payment enrolls never", async ({
  page,
  request,
}) => {
  test.setTimeout(60_000);
  const learner = await prisma.user.findUniqueOrThrow({
    where: { email: "learner@example.com" },
  });
  const program = await prisma.program.findUniqueOrThrow({
    where: { slug: "backend-development-bootcamp" },
    include: { cohorts: { orderBy: { startDate: "asc" }, take: 1 } },
  });
  const cohort = program.cohorts[0];
  if (!cohort) throw new Error("Paid-program seed batch is missing.");

  await prisma.payment.deleteMany({
    where: { userId: learner.id, programId: program.id },
  });
  await prisma.enrollment.deleteMany({
    where: { userId: learner.id, cohortId: cohort.id },
  });

  try {
    await login(page);
    await page.goto(`/programs/${program.slug}`);
    await page.getByRole("link", { name: "Continue to payment" }).click();
    await expect(
      page.getByRole("heading", { name: "Review your enrollment" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Continue to secure payment" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Chapa test checkout" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Complete payment" }).click();
    await expect(
      page.getByRole("heading", { name: "Payment verified" }),
    ).toBeVisible();
    await expect(
      prisma.enrollment.count({
        where: { userId: learner.id, cohortId: cohort.id },
      }),
    ).resolves.toBe(1);

    const successfulPayment = await prisma.payment.findFirstOrThrow({
      where: { userId: learner.id, programId: program.id, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });
    const webhookBody = JSON.stringify({
      tx_ref: successfulPayment.merchantReference,
      event: "charge.success",
    });
    for (let replay = 0; replay < 2; replay += 1) {
      const webhook = await request.post("/api/payments/chapa/webhook", {
        data: webhookBody,
        headers: {
          "content-type": "application/json",
          "x-yaye-test-signature": "valid",
        },
      });
      expect(webhook.ok()).toBe(true);
    }
    await expect(
      prisma.enrollment.count({
        where: { userId: learner.id, cohortId: cohort.id },
      }),
    ).resolves.toBe(1);
    await expect(
      prisma.paymentEvent.count({ where: { paymentId: successfulPayment.id } }),
    ).resolves.toBe(1);

    await prisma.enrollment.deleteMany({
      where: { userId: learner.id, cohortId: cohort.id },
    });
    await page.goto(`/checkout/${program.id}`);
    await page
      .getByRole("button", { name: "Continue to secure payment" })
      .click();
    await page.getByRole("link", { name: "Fail payment" }).click();
    await expect(
      page.getByRole("heading", { name: "Enrollment was not activated" }),
    ).toBeVisible();
    await expect(
      prisma.enrollment.count({
        where: { userId: learner.id, cohortId: cohort.id },
      }),
    ).resolves.toBe(0);
  } finally {
    await prisma.enrollment.deleteMany({
      where: { userId: learner.id, cohortId: cohort.id },
    });
    await prisma.payment.deleteMany({
      where: { userId: learner.id, programId: program.id },
    });
  }
});
