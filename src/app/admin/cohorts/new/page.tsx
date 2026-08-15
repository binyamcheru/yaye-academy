import Link from "next/link";

import { CohortForm } from "@/components/admin/cohort-form";
import { requireRole } from "@/modules/auth/session";
import {
  listInstructorOptions,
  listProgramOptions,
} from "@/modules/programs/service";

export default async function NewCohortPage() {
  await requireRole("ADMIN");
  const [programs, instructors] = await Promise.all([
    listProgramOptions(),
    listInstructorOptions(),
  ]);
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/cohorts"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Batches
      </Link>
      <header className="mt-6 border-b border-ink/15 pb-7">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          New delivery batch
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Schedule a batch
        </h1>
      </header>
      <div className="mt-8">
        <CohortForm programs={programs} instructors={instructors} />
      </div>
    </div>
  );
}
