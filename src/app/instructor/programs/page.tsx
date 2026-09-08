import Link from "next/link";

import { requireRole } from "@/modules/auth/session";
import { listInstructorPrograms } from "@/modules/communication/service";

export default async function InstructorProgramsPage() {
  const session = await requireRole("INSTRUCTOR");
  const cohorts = await listInstructorPrograms(session.user.id);
  const programs = Map.groupBy(cohorts, (cohort) => cohort.program.id);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Teaching register
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Assigned programs
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Only programs with a batch assigned to your instructor account appear
          here.
        </p>
      </header>
      <section className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white">
        {[...programs.values()].map((programCohorts) => {
          const program = programCohorts[0]!.program;
          return (
            <Link
              key={program.id}
              href={`/instructor/programs/${program.id}`}
              className="grid gap-4 px-5 py-6 hover:bg-yaye-pale/50 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {program.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {program.shortDescription}
                </p>
              </div>
              <span className="font-mono text-xs text-yaye-blue">
                {programCohorts.length} assigned batch
                {programCohorts.length === 1 ? "" : "es"}
              </span>
            </Link>
          );
        })}
        {!cohorts.length && (
          <p className="px-5 py-12 text-sm text-muted">
            No assigned programs yet. An administrator assigns instructors to
            batches.
          </p>
        )}
      </section>
    </div>
  );
}
