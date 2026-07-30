import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import { deleteCohortAction } from "@/modules/programs/actions";
import { getAdminCohort } from "@/modules/programs/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function AdminCohortPage({
  params,
}: Readonly<{ params: Promise<{ cohortId: string }> }>) {
  await requireRole("ADMIN");
  const { cohortId } = await params;
  const cohort = await getAdminCohort(cohortId);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/cohorts"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Batches
      </Link>
      <header className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-8">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            {cohort.status} batch
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            {cohort.name}
          </h1>
          <p className="mt-3 text-sm text-muted">{cohort.program.title}</p>
        </div>
        <Link
          href={`/admin/cohorts/${cohort.id}/edit`}
          className="border border-ink/25 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-yaye-pale"
        >
          Edit batch
        </Link>
      </header>

      <dl className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white px-5 sm:px-6">
        {[
          ["Program", cohort.program.title],
          ["Starts", dateFormatter.format(cohort.startDate)],
          ["Ends", dateFormatter.format(cohort.endDate)],
          [
            "Capacity",
            cohort.capacity ? `${cohort.capacity} learners` : "Not limited",
          ],
          [
            "Instructor",
            cohort.instructor
              ? `${cohort.instructor.name} · ${cohort.instructor.email}`
              : "Not assigned",
          ],
        ].map(([term, value]) => (
          <div key={term} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
            <dt className="font-mono text-[0.62rem] tracking-[0.1em] text-muted uppercase">
              {term}
            </dt>
            <dd className="text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <details className="mt-10 border border-danger/30 bg-white px-5 py-5">
        <summary className="cursor-pointer text-sm font-semibold text-danger">
          Delete batch
        </summary>
        <p className="mt-4 text-sm text-muted">
          This permanently removes the schedule. Cancel the batch instead when
          its history must remain available.
        </p>
        <form action={deleteCohortAction} className="mt-4">
          <input type="hidden" name="cohortId" value={cohort.id} />
          <button
            type="submit"
            className="bg-danger px-4 py-3 text-sm font-semibold text-white"
          >
            Permanently delete batch
          </button>
        </form>
      </details>
    </div>
  );
}
