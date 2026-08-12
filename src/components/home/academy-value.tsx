const practicePrinciples = [
  {
    title: "A route through the material",
    body: "Modules and lessons make the sequence visible, so learners know what comes next and why it matters.",
  },
  {
    title: "Work that leaves evidence",
    body: "Quizzes, repositories, demos, and practical submissions turn participation into reviewable work.",
  },
  {
    title: "Access to an instructor",
    body: "Live sessions, lesson questions, and structured feedback keep learning connected to an experienced practitioner.",
  },
  {
    title: "Progress with a definition",
    body: "Completion is calculated from learning activity and assessed work—not from simply opening a video.",
  },
] as const;

const instructorStandards = [
  [
    "01",
    "Relevant practice",
    "Expertise connected to the program being taught.",
  ],
  [
    "02",
    "Visible guidance",
    "Scheduled sessions, answers, and review—not a name on a page.",
  ],
  [
    "03",
    "Useful feedback",
    "Specific direction learners can apply to their next revision.",
  ],
] as const;

export function AcademyValue() {
  return (
    <>
      <section id="why-yaye" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-blue uppercase">
                Why Yaye Academy
              </p>
              <h2 className="mt-6 max-w-lg text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
                The standard is work you can show.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted">
                The academy is designed around deliberate instruction and
                demonstrable ability—not passive content consumption.
              </p>
            </div>

            <div className="border-t-2 border-ink">
              {practicePrinciples.map((principle, index) => (
                <article
                  key={principle.title}
                  className="grid gap-3 border-b border-ink/15 py-6 sm:grid-cols-[3rem_0.75fr_1fr] sm:gap-6"
                >
                  <span className="font-mono text-xs text-yaye-teal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted">
                    {principle.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <dl className="mt-14 grid border-y border-ink/15 bg-yaye-pale md:grid-cols-3">
            {[
              ["Coursework", "Lessons + practical repositories"],
              ["Assessment", "Quizzes + instructor review"],
              ["Outcome", "Measured progress + certificate"],
            ].map(([term, detail]) => (
              <div
                key={term}
                className="border-ink/15 px-5 py-6 md:border-r md:last:border-r-0"
              >
                <dt className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
                  {term}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-ink">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="instructors" className="border-y border-ink/15 bg-paper">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-ink/15 px-5 py-16 sm:px-8 lg:border-r lg:py-20 lg:pr-14">
            <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-blue uppercase">
              Instructor standard
            </p>
            <h2 className="mt-6 text-3xl leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              People teaching close to the work.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-muted">
              Instructor profiles will identify confirmed Yaye Academy teachers
              by role, expertise, and assigned program. No anonymous or invented
              profiles.
            </p>
          </div>

          <div className="px-5 py-10 sm:px-8 lg:py-12 lg:pl-14">
            <div className="divide-y divide-ink/15 border-y border-ink/15">
              {instructorStandards.map(([number, title, body]) => (
                <article
                  key={number}
                  className="grid gap-3 py-6 sm:grid-cols-[3rem_0.7fr_1fr] sm:gap-6"
                >
                  <span className="font-mono text-xs text-yaye-teal">
                    {number}
                  </span>
                  <h3 className="text-base font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-6 text-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
