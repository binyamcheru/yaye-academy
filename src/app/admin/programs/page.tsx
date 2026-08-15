import Link from "next/link";

import { requireRole } from "@/modules/auth/session";
import { listAdminPrograms } from "@/modules/programs/service";

export default async function AdminProgramsPage() {
  await requireRole("ADMIN");
  const programs = await listAdminPrograms();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-7">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Catalog operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Programs
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Build reusable curricula, prepare batches, and control what appears
            in the public academy catalog.
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Create program ↗
        </Link>
      </header>

      <section className="mt-8 overflow-x-auto bg-white">
        <div className="grid min-w-[46rem] grid-cols-[1fr_8rem_7rem_6rem] border-b-2 border-ink px-5 py-4 font-mono text-[0.62rem] tracking-[0.1em] text-muted uppercase">
          <span>Program</span>
          <span>Status</span>
          <span>Access</span>
          <span>Structure</span>
        </div>
        <div className="min-w-[46rem] divide-y divide-ink/10">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/admin/programs/${program.id}`}
              className="grid grid-cols-[1fr_8rem_7rem_6rem] items-center px-5 py-5 transition-colors hover:bg-yaye-pale/50"
            >
              <div>
                <p className="font-semibold text-ink">{program.title}</p>
                <p className="mt-1 font-mono text-[0.62rem] text-muted">
                  /{program.slug}
                </p>
              </div>
              <span className="text-xs font-semibold text-yaye-blue">
                {program.status}
              </span>
              <span className="text-xs text-muted">{program.accessType}</span>
              <span className="text-xs text-muted">
                {program._count.modules}M · {program._count.cohorts}B
              </span>
            </Link>
          ))}
          {!programs.length && (
            <p className="px-5 py-10 text-sm text-muted">No programs yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
