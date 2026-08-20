import Link from "next/link";

import { ProgressMeter } from "@/components/learner/progress-meter";

type EnrollmentCardProps = Readonly<{
  program: { id: string; title: string; shortDescription: string };
  batchName: string;
  status: string;
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
  };
}>;

export function EnrollmentCard({
  program,
  batchName,
  status,
  progress,
}: EnrollmentCardProps) {
  return (
    <article className="flex h-full flex-col border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-5 font-mono text-[0.6rem] font-semibold tracking-[0.1em] uppercase">
        <span className="text-yaye-blue">{batchName}</span>
        <span className="text-muted">{status}</span>
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-ink">
        {program.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        {program.shortDescription}
      </p>
      <div className="mt-8">
        <ProgressMeter percentage={progress.percentage} />
        <p className="mt-2 font-mono text-[0.6rem] tracking-[0.08em] text-muted uppercase">
          {progress.completedLessons} of {progress.totalLessons} lessons
          complete
        </p>
      </div>
      <Link
        href={`/dashboard/programs/${program.id}`}
        className="mt-7 self-start text-sm font-semibold text-yaye-blue underline decoration-yaye-teal underline-offset-4"
      >
        {progress.percentage ? "Continue learning" : "Start learning"} ↗
      </Link>
    </article>
  );
}
