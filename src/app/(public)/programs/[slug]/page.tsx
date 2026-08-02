import Link from "next/link";
import { notFound } from "next/navigation";

import { EnrollmentCta } from "@/components/programs/enrollment-cta";
import { getPublicProgram } from "@/modules/programs/public-service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function priceLabel(
  accessType: string,
  price: { toString(): string } | null,
  currency: string,
) {
  if (accessType === "FREE") return "Free access";
  return price
    ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        Number(price.toString()),
      )} ${currency}`
    : "Price to be announced";
}

export default async function ProgramDetailPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const program = await getPublicProgram(slug);
  if (!program) notFound();
  const outcomes = stringList(program.learningOutcomes);
  const requirements = stringList(program.requirements);
  const nextCohort = program.cohorts[0];

  return (
    <>
      <section className="border-b border-ink/15 bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
          <Link
            href="/programs"
            className="text-sm font-semibold text-yaye-blue"
          >
            ← Program catalog
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-3 font-mono text-[0.64rem] font-semibold tracking-[0.11em] uppercase">
                <span className="text-yaye-blue">{program.accessType}</span>
                <span className="text-muted">{program.level}</span>
                <span className="text-muted">
                  {program.durationWeeks
                    ? `${program.durationWeeks} weeks`
                    : "Flexible duration"}
                </span>
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
                {program.title}
              </h1>
              <p className="mt-7 max-w-3xl border-l-2 border-yaye-teal pl-5 text-xl leading-8 text-ink">
                {program.shortDescription}
              </p>
              <p className="mt-6 max-w-3xl text-base leading-7 whitespace-pre-line text-muted">
                {program.description}
              </p>
            </div>

            <aside className="border-t-2 border-ink bg-white px-5 py-6">
              <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
                Program register
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                {priceLabel(
                  program.accessType,
                  program.price,
                  program.currency,
                )}
              </p>
              <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                <div className="py-4">
                  <dt className="font-mono text-[0.58rem] tracking-[0.1em] text-muted uppercase">
                    Next batch
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    {nextCohort
                      ? `${nextCohort.name} · ${dateFormatter.format(nextCohort.startDate)}`
                      : "To be announced"}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="font-mono text-[0.58rem] tracking-[0.1em] text-muted uppercase">
                    Instructor
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    {nextCohort?.instructor?.name ?? "To be announced"}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="font-mono text-[0.58rem] tracking-[0.1em] text-muted uppercase">
                    Delivery
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-ink">
                    Online · Instructor-led
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <EnrollmentCta
                  programId={program.id}
                  accessType={program.accessType as "FREE" | "PAID"}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.12em] text-yaye-blue uppercase">
              Curriculum preview
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">
              {program.modules.length} structured modules
            </h2>
            <div className="mt-7 border-t-2 border-ink">
              {program.modules.map((moduleRecord) => (
                <article
                  key={moduleRecord.id}
                  className="border-b border-ink/15 py-6"
                >
                  <div className="grid gap-3 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
                    <span className="font-mono text-xs text-yaye-teal">
                      {String(moduleRecord.order).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        {moduleRecord.title}
                      </h3>
                      {moduleRecord.description && (
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {moduleRecord.description}
                        </p>
                      )}
                      <ul className="mt-4 space-y-2 text-sm text-muted">
                        {moduleRecord.lessons.map((lesson) => (
                          <li key={lesson.id}>— {lesson.title}</li>
                        ))}
                      </ul>
                    </div>
                    <span className="font-mono text-[0.58rem] text-muted uppercase">
                      {moduleRecord.lessons.length} lessons
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <section className="border-t-2 border-ink pt-5">
              <h2 className="text-xl font-semibold text-ink">
                What you will learn
              </h2>
              <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {outcomes.map((outcome, index) => (
                  <li
                    key={outcome}
                    className="grid grid-cols-[2rem_1fr] gap-3 py-4 text-sm"
                  >
                    <span className="font-mono text-[0.62rem] text-yaye-teal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-ink">{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="border-t-2 border-ink pt-5">
              <h2 className="text-xl font-semibold text-ink">Requirements</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                {requirements.map((requirement) => (
                  <li key={requirement}>— {requirement}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
