import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("a learner can register, use protected access, and log out", async ({
  page,
}) => {
  const email = `e2e-learner-${Date.now()}@example.com`;
  const password = "Testing1234!";

  try {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole("link", { name: "Create an account" }).click();
    await page.getByLabel("Full name").fill("Browser Test Learner");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Create learner account" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /Welcome back, Browser/ }),
    ).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Enter workspace" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  } finally {
    await prisma.user.deleteMany({ where: { email } });
  }
});

test.describe("seeded role access", () => {
  const accounts = [
    {
      email: "admin@example.com",
      password: "Admin1234!",
      path: "/admin",
      heading: /academy control desk is ready/i,
    },
    {
      email: "instructor@example.com",
      password: "Instructor1234!",
      path: "/instructor",
      heading: /welcome, yaye/i,
    },
  ] as const;

  for (const account of accounts) {
    test(`${account.email} reaches the correct workspace`, async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Email address").fill(account.email);
      await page.getByLabel("Password").fill(account.password);
      await page.getByRole("button", { name: "Enter workspace" }).click();

      await expect(page).toHaveURL(new RegExp(`${account.path}$`));
      await expect(
        page.getByRole("heading", { name: account.heading }),
      ).toBeVisible();
    });
  }
});
