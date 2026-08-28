import { describe, expect, it } from "vitest";

import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiresAt,
  invitationState,
  normalizeInvitationEmail,
} from "@/modules/invitations/token";

describe("private invitation tokens", () => {
  it("creates unique high-entropy tokens and stable one-way hashes", () => {
    const first = generateInvitationToken();
    const second = generateInvitationToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(hashInvitationToken(first)).toHaveLength(64);
    expect(hashInvitationToken(first)).toBe(hashInvitationToken(first));
    expect(hashInvitationToken(first)).not.toContain(first);
  });

  it("normalizes the intended learner email", () => {
    expect(normalizeInvitationEmail("  Sara@Example.COM ")).toBe(
      "sara@example.com",
    );
  });

  it("expires invitations seven days after creation", () => {
    const now = new Date("2026-08-28T09:00:00.000Z");
    expect(invitationExpiresAt(now).toISOString()).toBe(
      "2026-09-04T09:00:00.000Z",
    );
  });
});

describe("private invitation state", () => {
  const now = new Date("2026-08-28T09:00:00.000Z");

  it("reports pending and expired invitations at the exact boundary", () => {
    expect(
      invitationState(
        {
          acceptedAt: null,
          cancelledAt: null,
          expiresAt: new Date("2026-08-28T09:00:00.001Z"),
        },
        now,
      ),
    ).toBe("PENDING");
    expect(
      invitationState(
        {
          acceptedAt: null,
          cancelledAt: null,
          expiresAt: now,
        },
        now,
      ),
    ).toBe("EXPIRED");
  });

  it("keeps cancellation and acceptance terminal", () => {
    expect(
      invitationState(
        {
          acceptedAt: now,
          cancelledAt: null,
          expiresAt: new Date("2026-08-27T09:00:00.000Z"),
        },
        now,
      ),
    ).toBe("ACCEPTED");
    expect(
      invitationState(
        {
          acceptedAt: null,
          cancelledAt: now,
          expiresAt: new Date("2026-08-29T09:00:00.000Z"),
        },
        now,
      ),
    ).toBe("CANCELLED");
  });
});
