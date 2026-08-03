import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("admin can build and publish a complete program", async ({ page }) => {
  test.setTimeout(60_000);
  const suffix = Date.now();
  const title = `Backend Development Browser ${suffix}`;
  const slug = `backend-development-browser-${suffix}`;

  try {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("admin@example.com");
    await page.getByLabel("Password").fill("Admin1234!");
    await page.getByRole("button", { name: "Enter workspace" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/programs/new");
    await page.getByLabel("Title").fill(title);
    await expect(page.getByLabel("URL slug")).toHaveValue(slug);
    await page
      .getByLabel("Short description")
      .fill(
        "A browser-tested program for building dependable backend services.",
      );
    await page
      .getByLabel("Full description")
      .fill(
        "Learners design and build a backend service while practicing relational modeling, validation, authentication, testing, and deployment.",
      );
    await page.getByLabel("Level").selectOption("INTERMEDIATE");
    await page.getByLabel("Access type").selectOption("FREE");
    await page.getByLabel("Duration (weeks)").fill("8");
    await page
      .getByLabel("Learning outcomes")
      .fill("Build a REST API\nModel relational data");
    await page
      .getByLabel("Requirements")
      .fill("Basic JavaScript\nA development computer");
    await page.getByRole("button", { name: "Create program" }).click();
    await expect(page).toHaveURL(/\/admin\/programs\/[^/]+$/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.getByRole("button", { name: "Publish program" }).click();
    await expect(
      page.getByText(
        "Add at least one module and one published lesson before publishing.",
      ),
    ).toBeVisible();

    await page.getByText("+ Add module").click();
    await page.getByLabel("Module title").last().fill("API Foundations");
    await page
      .getByLabel("Description")
      .last()
      .fill("HTTP resources, validation, and service structure.");
    await page.getByRole("button", { name: "Add module" }).click();
    await expect(
      page.getByRole("heading", { name: "API Foundations" }),
    ).toBeVisible();

    await page.getByText("+ Add lesson").click();
    await page
      .getByLabel("Lesson title")
      .last()
      .fill("Designing REST resources");
    await page
      .getByLabel("Lesson content")
      .last()
      .fill(
        "Turn application requirements into clear resources, routes, validation rules, and HTTP responses.",
      );
    await page.getByLabel("Publish this lesson").check();
    await page.getByRole("button", { name: "Add lesson" }).click();
    await expect(page.getByText("Designing REST resources")).toBeVisible();

    await page.goto("/admin/cohorts/new");
    await page.getByLabel("Program").selectOption({ label: title });
    await page.getByLabel("Batch name").fill("September Browser Batch");
    await page.getByLabel("Start date").fill("2027-09-06");
    await page.getByLabel("End date").fill("2027-11-01");
    await page.getByLabel("Capacity (optional)").fill("24");
    await page.getByLabel("Main instructor").selectOption({
      label: "Yaye Academy Instructor · instructor@example.com",
    });
    await page.getByRole("button", { name: "Create batch" }).click();
    await expect(
      page.getByRole("heading", { name: "September Browser Batch" }),
    ).toBeVisible();

    const program = await prisma.program.findUniqueOrThrow({ where: { slug } });
    await page.goto(`/admin/programs/${program.id}`);
    await page.getByRole("button", { name: "Publish program" }).click();
    await expect(page.getByText("Program is now published.")).toBeVisible();

    await page.goto(`/programs/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(
      page.getByText("September Browser Batch", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("Yaye Academy Instructor")).toBeVisible();

    await page.goto(`/programs?search=${encodeURIComponent(title)}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  } finally {
    await prisma.program.deleteMany({ where: { slug } });
  }
});

test("private programs stay out of the public catalog", async ({ page }) => {
  await page.goto("/programs");
  await expect(page.getByText("Internal Security Training")).toHaveCount(0);

  const response = await page.goto("/programs/internal-security-training");
  expect(response?.status()).toBe(404);
});
