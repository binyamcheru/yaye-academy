import { describe, expect, it } from "vitest";

import { announcementSchema, liveSessionSchema } from "./schemas";

const validSession = {
  programId: "program-1",
  cohortId: "cohort-1",
  title: "API design clinic",
  description: "Bring the resource model from this week's lesson.",
  startsAt: "2026-10-10T06:00:00.000Z",
  endsAt: "2026-10-10T07:30:00.000Z",
  meetingUrl: "https://meet.google.com/example-room",
  recordingUrl: "",
  slidesUrl: "",
  resourceUrl: "",
};

describe("communication schemas", () => {
  it("turns explicit UTC instants into dates", () => {
    const result = liveSessionSchema.parse(validSession);

    expect(result.startsAt.toISOString()).toBe(validSession.startsAt);
    expect(result.endsAt?.toISOString()).toBe(validSession.endsAt);
    expect(result.recordingUrl).toBeUndefined();
  });

  it("rejects an ending time before the start", () => {
    const result = liveSessionSchema.safeParse({
      ...validSession,
      endsAt: "2026-10-10T05:00:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endsAt).toContain(
        "End time must be after the start time.",
      );
    }
  });

  it("requires an announcement body with useful content", () => {
    expect(
      announcementSchema.safeParse({
        programId: "program-1",
        cohortId: "cohort-1",
        title: "Schedule note",
        body: "Short",
      }).success,
    ).toBe(false);
  });
});
