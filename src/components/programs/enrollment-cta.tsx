import Link from "next/link";

import { getCurrentSession } from "@/modules/auth/session";
import { findLearnerEnrollmentForProgram } from "@/modules/enrollments/service";
import { FreeEnrollmentForm } from "@/components/programs/free-enrollment-form";

export async function EnrollmentCta({
  programId,
  accessType,
}: Readonly<{ programId: string; accessType: "FREE" | "PAID" }>) {
  const session = await getCurrentSession();

  if (accessType === "PAID") {
    if (!session) {
      return (
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/checkout/${programId}`)}`}
          className="block bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Log in to continue to payment ↗
        </Link>
      );
    }
    if (session.user.role !== "LEARNER") {
      return (
        <p className="border-l-2 border-yaye-teal bg-yaye-pale px-4 py-3 text-sm text-ink">
          Paid enrollment is available through a learner account.
        </p>
      );
    }
    const enrollment = await findLearnerEnrollmentForProgram(
      session.user.id,
      programId,
    );
    if (enrollment) {
      return (
        <Link
          href={`/dashboard/programs/${programId}`}
          className="block bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Open this program ↗
        </Link>
      );
    }
    return (
      <Link
        href={`/checkout/${programId}`}
        className="block bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue"
      >
        Continue to payment ↗
      </Link>
    );
  }

  if (!session) {
    return (
      <>
        <Link
          href="/register"
          className="block bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Create an account to enroll ↗
        </Link>
        <p className="mt-3 text-xs leading-5 text-muted">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-yaye-blue underline"
          >
            Log in
          </Link>
        </p>
      </>
    );
  }

  if (session.user.role !== "LEARNER") {
    return (
      <p className="border-l-2 border-yaye-teal bg-yaye-pale px-4 py-3 text-sm text-ink">
        Free enrollment is available through a learner account.
      </p>
    );
  }

  const enrollment = await findLearnerEnrollmentForProgram(
    session.user.id,
    programId,
  );
  if (enrollment) {
    return (
      <Link
        href={`/dashboard/programs/${programId}`}
        className="block bg-ink px-5 py-4 text-center text-sm font-semibold text-white hover:bg-yaye-blue"
      >
        Open this program ↗
      </Link>
    );
  }

  return <FreeEnrollmentForm programId={programId} />;
}
