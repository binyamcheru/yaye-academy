type WorkspaceOverviewProps = Readonly<{
  eyebrow: string;
  name: string;
  title: string;
  description: string;
  register: ReadonlyArray<Readonly<{ label: string; value: string }>>;
  nextStep: string;
}>;

export function WorkspaceOverview({
  eyebrow,
  name,
  title,
  description,
  register,
  nextStep,
}: WorkspaceOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold tracking-[0.14em] text-yaye-blue uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
            {title}, {name.split(" ")[0]}.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            {description}
          </p>
        </div>
        <div className="border-l-2 border-yaye-teal bg-white px-5 py-4">
          <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
            Next build milestone
          </p>
          <p className="mt-2 text-sm leading-6 font-semibold text-ink">
            {nextStep}
          </p>
        </div>
      </section>

      <section className="mt-8 bg-white">
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-ink">Workspace register</h2>
          <span className="status-label">Access active</span>
        </div>
        <dl className="divide-y divide-ink/10">
          {register.map((item, index) => (
            <div
              key={item.label}
              className="grid grid-cols-[2rem_minmax(8rem,0.45fr)_1fr] gap-4 px-5 py-5 sm:px-6"
            >
              <span className="font-mono text-xs text-yaye-teal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <dt className="font-mono text-[0.65rem] tracking-[0.1em] text-muted uppercase">
                {item.label}
              </dt>
              <dd className="text-sm font-semibold text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
