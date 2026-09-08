import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import { getInstructorProgram } from "@/modules/communication/service";

export default async function InstructorProgramPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("INSTRUCTOR");
  const { programId } = await params;
  const workspace = await getInstructorProgram(session.user.id, programId);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/instructor/programs"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Assigned programs
      </Link>
      <header className="mt-6 border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Instructor program
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          {workspace.program.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          {workspace.program.shortDescription}
        </p>
      </header>
      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        {[
          {
            href: `/instructor/programs/${programId}/sessions`,
            eyebrow: "Live delivery",
            title: "Sessions",
            description:
              "Schedule external meetings and share follow-up resources.",
          },
          {
            href: `/instructor/programs/${programId}/announcements`,
            eyebrow: "Batch updates",
            title: "Announcements",
            description:
              "Publish an update to eligible learners in an assigned batch.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-t-2 border-ink bg-white px-5 py-6 hover:bg-yaye-pale/50"
          >
            <p className="font-mono text-[0.62rem] tracking-[0.1em] text-yaye-blue uppercase">
              {item.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {item.description}
            </p>
          </Link>
        ))}
      </section>
      <section className="mt-9 border-t-2 border-ink bg-white px-5 py-6">
        <h2 className="text-lg font-semibold text-ink">Assigned batches</h2>
        <div className="mt-4 divide-y divide-ink/10">
          {workspace.cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="flex justify-between gap-4 py-4 text-sm"
            >
              <span className="font-semibold text-ink">{cohort.name}</span>
              <span className="text-muted">
                {cohort._count.enrollments} learners
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
