import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/(public)/page";

vi.mock("@/modules/programs/public-service", () => ({
  listPublicPrograms: vi.fn().mockResolvedValue([
    {
      slug: "backend-development-bootcamp",
      accessType: "PAID",
      title: "Backend Development Bootcamp",
      shortDescription: "Build production-minded APIs.",
      durationWeeks: 12,
      level: "INTERMEDIATE",
    },
  ]),
}));

describe("HomePage", () => {
  it("renders the academy proposition and program preview", async () => {
    render(await HomePage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Yaye Academy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Create learner account")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Backend Development Bootcamp" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The standard is work you can show.",
      }),
    ).toBeInTheDocument();
  });
});
