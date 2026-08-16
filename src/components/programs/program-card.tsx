import Link from "next/link";

type ProgramCardProps = Readonly<{
  program: {
    slug: string;
    title: string;
    shortDescription: string;
    level: string;
    accessType: "FREE" | "PAID";
    price: string | null;
    currency: string;
    durationWeeks: number | null;
    moduleCount: number;
    nextBatch?: string;
  };
  index: number;
}>;

function priceLabel(program: ProgramCardProps["program"]) {
  if (program.accessType === "FREE") return "Free";
  if (!program.price) return "Price pending";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(program.price),
  )} ${program.currency}`;
}

export function ProgramCard({ program, index }: ProgramCardProps) {
  return (
    <article className="flex h-full flex-col border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
      <div className="flex items-center justify-between font-mono text-[0.62rem] font-semibold tracking-[0.1em] uppercase">
        <span className="text-yaye-teal">
          YA · {String(index + 1).padStart(2, "0")}
        </span>
        <span className="border border-yaye-blue/30 px-2 py-1 text-yaye-blue">
          {program.accessType}
        </span>
      </div>
      <h2 className="mt-8 text-2xl leading-tight font-semibold tracking-[-0.025em] text-ink">
        <Link
          href={`/programs/${program.slug}`}
          className="hover:text-yaye-blue"
        >
          {program.title}
        </Link>
      </h2>
      <p className="mt-4 text-sm leading-6 text-muted">
        {program.shortDescription}
      </p>
      <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {[
          ["Level", program.level.toLowerCase()],
          [
            "Duration",
            program.durationWeeks
              ? `${program.durationWeeks} weeks`
              : "Flexible",
          ],
          ["Curriculum", `${program.moduleCount} modules`],
          ["Next batch", program.nextBatch ?? "To be announced"],
        ].map(([term, value]) => (
          <div
            key={term}
            className="grid grid-cols-[6rem_1fr] gap-3 py-3 text-xs"
          >
            <dt className="font-mono text-[0.58rem] tracking-[0.08em] text-muted uppercase">
              {term}
            </dt>
            <dd className="font-semibold text-ink capitalize">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <p className="text-lg font-semibold text-ink">{priceLabel(program)}</p>
        <Link
          href={`/programs/${program.slug}`}
          className="text-sm font-semibold text-yaye-blue underline decoration-yaye-teal underline-offset-4"
        >
          View program ↗
        </Link>
      </div>
    </article>
  );
}
