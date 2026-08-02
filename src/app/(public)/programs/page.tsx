import Link from "next/link";

import { ProgramCard } from "@/components/programs/program-card";
import { listPublicPrograms } from "@/modules/programs/public-service";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const accessTypes = ["FREE", "PAID"] as const;
const batchFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function ProgramsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ search?: string; level?: string; access?: string }>;
}>) {
  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const level = levels.find((item) => item === query.level);
  const accessType = accessTypes.find((item) => item === query.access);
  const programs = await listPublicPrograms({ search, level, accessType });

  return (
    <>
      <section className="border-b border-ink/15 bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-blue uppercase">
            Public catalog
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <h1 className="text-5xl leading-[0.95] font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
              Technical programs
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted">
              Instructor-led online training with structured curriculum,
              practical work, and progress that has a clear definition.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-workspace">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
          <form
            className="grid gap-4 border-t-2 border-ink bg-white p-5 md:grid-cols-[1fr_12rem_10rem_auto] md:items-end"
            method="get"
          >
            <label>
              <span className="auth-label">Search programs</span>
              <input
                className="auth-input"
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Backend, Git, React…"
              />
            </label>
            <label>
              <span className="auth-label">Level</span>
              <select
                className="auth-input"
                name="level"
                defaultValue={level ?? ""}
              >
                <option value="">All levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </label>
            <label>
              <span className="auth-label">Access</span>
              <select
                className="auth-input"
                name="access"
                defaultValue={accessType ?? ""}
              >
                <option value="">Free + paid</option>
                <option value="FREE">Free</option>
                <option value="PAID">Paid</option>
              </select>
            </label>
            <button
              type="submit"
              className="bg-ink px-5 py-[0.9rem] text-sm font-semibold text-white hover:bg-yaye-blue"
            >
              Apply filters
            </button>
          </form>

          <div className="mt-7 flex items-center justify-between gap-5">
            <p className="font-mono text-[0.64rem] tracking-[0.1em] text-muted uppercase">
              {programs.length} published{" "}
              {programs.length === 1 ? "program" : "programs"}
            </p>
            {(search || level || accessType) && (
              <Link
                href="/programs"
                className="text-sm font-semibold text-yaye-blue underline"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                index={index}
                program={{
                  slug: program.slug,
                  title: program.title,
                  shortDescription: program.shortDescription,
                  level: program.level,
                  accessType: program.accessType as "FREE" | "PAID",
                  price: program.price?.toString() ?? null,
                  currency: program.currency,
                  durationWeeks: program.durationWeeks,
                  moduleCount: program.modules.length,
                  nextBatch: program.cohorts[0]
                    ? batchFormatter.format(program.cohorts[0].startDate)
                    : undefined,
                }}
              />
            ))}
          </div>

          {!programs.length && (
            <div className="mt-5 border border-dashed border-ink/25 bg-white px-5 py-14 text-center">
              <h2 className="text-xl font-semibold text-ink">
                No matching programs
              </h2>
              <p className="mt-2 text-sm text-muted">
                Clear one or more filters to see the current catalog.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
