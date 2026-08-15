import Link from "next/link";
import { notFound } from "next/navigation";

import { CohortForm } from "@/components/admin/cohort-form";
import { requireRole } from "@/modules/auth/session";
import {
  getAdminCohort,
  listInstructorOptions,
  listProgramOptions,
} from "@/modules/programs/service";

function inputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditCohortPage({
  params,
}: Readonly<{ params: Promise<{ cohortId: string }> }>) {
  await requireRole("ADMIN");
  const { cohortId } = await params;
  const [cohort, programs, instructors] = await Promise.all([
    getAdminCohort(cohortId),
    listProgramOptions(),
    listInstructorOptions(),
  ]);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/cohorts/${cohort.id}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← {cohort.name}
      </Link>
      <header className="mt-6 border-b border-ink/15 pb-7">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Batch settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Edit batch
        </h1>
      </header>
      <div className="mt-8">
        <CohortForm
          programs={programs}
          instructors={instructors}
          initial={{
            id: cohort.id,
            programId: cohort.programId,
            instructorId: cohort.instructorId ?? undefined,
            name: cohort.name,
            startDate: inputDate(cohort.startDate),
            endDate: inputDate(cohort.endDate),
            capacity: cohort.capacity ?? undefined,
            status: cohort.status,
          }}
        />
      </div>
    </div>
  );
}
