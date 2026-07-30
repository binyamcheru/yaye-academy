import Link from "next/link";

import { requireRole } from "@/modules/auth/session";
import { listAdminCohorts } from "@/modules/programs/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function AdminCohortsPage() {
  await requireRole("ADMIN");
  const cohorts = await listAdminCohorts();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-7">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Delivery operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Batches
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Schedule a reusable program for a defined learner group and assign
            its main instructor.
          </p>
        </div>
        <Link
          href="/admin/cohorts/new"
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Create batch ↗
        </Link>
      </header>

      <section className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white">
        {cohorts.map((cohort) => (
          <Link
            key={cohort.id}
            href={`/admin/cohorts/${cohort.id}`}
            className="grid gap-4 px-5 py-5 hover:bg-yaye-pale/50 sm:grid-cols-[1fr_0.8fr_0.8fr_7rem] sm:items-center"
          >
            <div>
              <p className="font-semibold text-ink">{cohort.name}</p>
              <p className="mt-1 text-xs text-muted">{cohort.program.title}</p>
            </div>
            <span className="text-xs text-muted">
              {dateFormatter.format(cohort.startDate)}
            </span>
            <span className="text-xs text-muted">
              {cohort.instructor?.name ?? "Unassigned"}
            </span>
            <span className="font-mono text-[0.62rem] font-semibold text-yaye-blue">
              {cohort.status}
            </span>
          </Link>
        ))}
        {!cohorts.length && (
          <p className="px-5 py-10 text-sm text-muted">No batches yet.</p>
        )}
      </section>
    </div>
  );
}
