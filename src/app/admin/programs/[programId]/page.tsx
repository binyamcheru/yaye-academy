import Link from "next/link";
import { notFound } from "next/navigation";

import { CurriculumManager } from "@/components/admin/curriculum-manager";
import { ProgramStatusControls } from "@/components/admin/program-status-controls";
import { requireRole } from "@/modules/auth/session";
import { deleteProgramAction } from "@/modules/programs/actions";
import { getAdminProgram } from "@/modules/programs/service";

export default async function AdminProgramPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  await requireRole("ADMIN");
  const { programId } = await params;
  const program = await getAdminProgram(programId);
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/programs"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Programs
      </Link>
      <header className="mt-6 grid gap-7 border-b-2 border-ink pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap gap-3 font-mono text-[0.62rem] tracking-[0.1em] uppercase">
            <span className="text-yaye-blue">{program.status}</span>
            <span className="text-muted">{program.accessType}</span>
            <span className="text-muted">{program.level}</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink">
            {program.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            {program.shortDescription}
          </p>
        </div>
        <Link
          href={`/admin/programs/${program.id}/edit`}
          className="border border-ink/25 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-yaye-pale"
        >
          Edit details
        </Link>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="bg-white px-5 py-6 sm:px-6">
          <h2 className="text-lg font-semibold text-ink">
            Publication control
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Publishing requires curriculum, a published lesson, and an upcoming
            or active batch with an instructor.
          </p>
          <div className="mt-5">
            <ProgramStatusControls
              programId={program.id}
              status={program.status}
            />
          </div>
        </div>
        <dl className="divide-y divide-ink/10 bg-white px-5 py-3">
          {[
            ["Modules", String(program.modules.length)],
            [
              "Lessons",
              String(
                program.modules.reduce(
                  (sum, item) => sum + item.lessons.length,
                  0,
                ),
              ),
            ],
            ["Batches", String(program.cohorts.length)],
            [
              "Price",
              program.accessType === "PAID"
                ? `${program.price?.toString() ?? "—"} ${program.currency}`
                : program.accessType,
            ],
          ].map(([term, value]) => (
            <div key={term} className="flex justify-between gap-5 py-3 text-sm">
              <dt className="text-muted">{term}</dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Program structure
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Curriculum</h2>
          </div>
        </div>
        <CurriculumManager programId={program.id} modules={program.modules} />
      </section>

      <section className="mt-10 border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">Batches</h2>
            <p className="mt-1 text-sm text-muted">
              {program.cohorts.length
                ? `${program.cohorts.length} batch records attached.`
                : "No batch has been scheduled."}
            </p>
          </div>
          <Link
            href="/admin/cohorts/new"
            className="bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
          >
            Create batch
          </Link>
        </div>
        <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
          {program.cohorts.map((cohort) => (
            <Link
              key={cohort.id}
              href={`/admin/cohorts/${cohort.id}`}
              className="grid gap-2 py-4 text-sm hover:text-yaye-blue sm:grid-cols-[1fr_10rem_1fr]"
            >
              <span className="font-semibold">{cohort.name}</span>
              <span>{cohort.status}</span>
              <span>{cohort.instructor?.name ?? "Instructor unassigned"}</span>
            </Link>
          ))}
        </div>
      </section>

      <details className="mt-10 border border-danger/30 bg-white px-5 py-5">
        <summary className="cursor-pointer text-sm font-semibold text-danger">
          Danger zone
        </summary>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Deleting a program permanently removes its modules, lessons, and
          batches. Prefer archiving for records that have been used.
        </p>
        <form action={deleteProgramAction} className="mt-4">
          <input type="hidden" name="programId" value={program.id} />
          <button
            type="submit"
            className="bg-danger px-4 py-3 text-sm font-semibold text-white"
          >
            Permanently delete program
          </button>
        </form>
      </details>
    </div>
  );
}
