import { expect, test } from "@playwright/test";

test("shows the branded academy proposition", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Yaye Academy" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Backend Development Bootcamp" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The standard is work you can show." }),
  ).toBeVisible();
});

test("reports a healthy database connection", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    database: "connected",
  });
});
