import Link from "next/link";

import { AcademyCta } from "@/components/home/academy-cta";
import { AcademyValue } from "@/components/home/academy-value";
import { ProgramPreview } from "@/components/home/program-preview";
import { listPublicPrograms } from "@/modules/programs/public-service";

const academyRegister = [
  ["Delivery", "Online, instructor-led"],
  ["Access", "Free · Paid · Private"],
  ["Learning", "Lessons · Live sessions · Practice"],
  ["Outcome", "Measured progress · Certificate"],
];

const learningModel = [
  {
    code: "01 / LEARN",
    title: "Structured foundations",
    body: "Clear modules, focused lessons, and external live sessions keep each batch moving together.",
  },
  {
    code: "02 / PRACTICE",
    title: "Work that can be reviewed",
    body: "Quizzes and practical repository-based assignments turn understanding into evidence.",
  },
  {
    code: "03 / PROVE",
    title: "Feedback and completion",
    body: "Instructor review, visible progress, and verifiable certificates make achievement concrete.",
  },
];

export default async function HomePage() {
  const publicPrograms = await listPublicPrograms({ take: 3 });

  return (
    <>
      <section id="academy" className="border-b border-ink/15 bg-paper">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.65fr)]">
          <div className="border-ink/15 px-5 py-16 sm:px-8 sm:py-24 lg:border-r lg:py-28 lg:pr-16">
            <div className="flex items-center gap-4 font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-blue uppercase">
              <span>Yaye Tech learning division</span>
              <span className="h-px w-12 bg-yaye-teal" aria-hidden="true" />
              <span>Addis Ababa</span>
            </div>

            <h1
              aria-label="Yaye Academy"
              className="mt-10 text-6xl leading-[0.9] font-semibold tracking-[-0.055em] text-ink sm:text-7xl lg:text-[6.7rem]"
            >
              Yaye
              <br />
              Academy
            </h1>

            <p className="mt-9 max-w-2xl border-l-2 border-yaye-teal pl-5 text-xl leading-8 text-ink sm:text-2xl">
              Training the people who build the future.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Structured technical programs with instructor guidance, practical
              work, visible progress, and outcomes learners can demonstrate.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-yaye-blue"
              >
                <span className="size-2 bg-yaye-teal" aria-hidden="true" />
                Create learner account
              </Link>
              <span className="font-mono text-[0.67rem] tracking-[0.12em] text-muted uppercase">
                Online · Instructor-led · Practical
              </span>
            </div>
          </div>

          <aside className="bg-white px-5 py-12 sm:px-8 lg:py-20">
            <div className="flex items-end justify-between border-b-2 border-ink pb-4">
              <div>
                <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
                  Academy register
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  V1 training model
                </h2>
              </div>
              <span className="font-mono text-4xl font-light text-yaye-pale">
                001
              </span>
            </div>

            <dl className="divide-y divide-ink/15">
              {academyRegister.map(([term, detail]) => (
                <div
                  key={term}
                  className="grid grid-cols-[6rem_1fr] gap-5 py-5"
                >
                  <dt className="font-mono text-[0.65rem] tracking-[0.1em] text-muted uppercase">
                    {term}
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 bg-yaye-pale p-5">
              <p className="font-mono text-[0.65rem] tracking-[0.12em] text-yaye-blue uppercase">
                Built for
              </p>
              <p className="mt-2 text-sm leading-6 text-ink">
                Learners who want a clear route from technical foundations to
                work they can demonstrate.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <ProgramPreview
        programs={publicPrograms.map((program) => ({
          slug: program.slug,
          access: program.accessType as "FREE" | "PAID",
          title: program.title,
          summary: program.shortDescription,
          durationWeeks: program.durationWeeks,
          level: program.level.toLowerCase(),
        }))}
      />

      <section id="model" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-6 border-b border-ink/15 pb-8 md:grid-cols-[0.65fr_1.35fr] md:items-end">
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-blue uppercase">
              The learning model
            </p>
            <h2 className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
              A clear path from instruction to demonstrated ability.
            </h2>
          </div>

          <div className="divide-y divide-ink/15">
            {learningModel.map((stage) => (
              <article
                key={stage.code}
                className="grid gap-4 py-8 md:grid-cols-[0.65fr_0.7fr_1fr] md:gap-8"
              >
                <p className="font-mono text-[0.67rem] font-semibold tracking-[0.12em] text-yaye-teal">
                  {stage.code}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {stage.title}
                </h3>
                <p className="max-w-xl text-sm leading-6 text-muted">
                  {stage.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AcademyValue />
      <AcademyCta />
    </>
  );
}
