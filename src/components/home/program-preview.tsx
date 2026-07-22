import Link from "next/link";

type ProgramPreviewProps = Readonly<{
  programs: ReadonlyArray<
    Readonly<{
      slug: string;
      access: "FREE" | "PAID";
      title: string;
      summary: string;
      durationWeeks: number | null;
      level: string;
    }>
  >;
}>;

export function ProgramPreview({ programs }: ProgramPreviewProps) {
  return (
    <section id="programs" className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-7 border-b border-white/20 pb-9 md:grid-cols-[0.65fr_1.35fr] md:items-end">
          <div>
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-teal uppercase">
              Program preview
            </p>
            <p className="mt-3 font-mono text-xs tracking-[0.08em] text-white/50 uppercase">
              Published catalog
            </p>
          </div>
          <h2 className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">
            Focused technical programs, organized like working syllabi.
          </h2>
        </div>

        <div className="grid border-b border-white/20 lg:grid-cols-2">
          {programs.map((program, index) => (
            <article
              key={program.slug}
              className="flex min-h-[25rem] flex-col border-white/20 py-8 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <div className="flex items-center justify-between font-mono text-[0.64rem] font-semibold tracking-[0.12em] uppercase">
                <span className="text-yaye-teal">
                  YA · {String(index + 1).padStart(2, "0")}
                </span>
                <span className="border border-white/25 px-2 py-1 text-white/70">
                  {program.access}
                </span>
              </div>
              <p className="mt-10 font-mono text-5xl font-light text-white/15">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-5 text-2xl leading-tight font-semibold tracking-[-0.02em]">
                <Link
                  href={`/programs/${program.slug}`}
                  className="hover:text-yaye-teal"
                >
                  {program.title}
                </Link>
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/65">
                {program.summary}
              </p>

              <dl className="mt-auto divide-y divide-white/15 border-t border-white/15 pt-1">
                <div className="grid grid-cols-[5rem_1fr] gap-4 py-3">
                  <dt className="font-mono text-[0.6rem] tracking-[0.1em] text-white/45 uppercase">
                    Duration
                  </dt>
                  <dd className="text-xs font-semibold">
                    {program.durationWeeks
                      ? `${program.durationWeeks} weeks`
                      : "Flexible"}
                  </dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-4 py-3">
                  <dt className="font-mono text-[0.6rem] tracking-[0.1em] text-white/45 uppercase">
                    Level
                  </dt>
                  <dd className="text-xs font-semibold">{program.level}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-2xl text-xs leading-5 text-white/50">
            Only published free and paid programs appear here. Private company
            training remains invitation-only.
          </p>
          <Link
            href="/programs"
            className="text-sm font-semibold text-white underline decoration-yaye-teal underline-offset-4"
          >
            Browse the full catalog ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
