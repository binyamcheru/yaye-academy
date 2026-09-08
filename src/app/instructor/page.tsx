import Link from "next/link";

import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import {
  listInstructorPrograms,
  listUpcomingInstructorSessions,
} from "@/modules/communication/service";

export default async function InstructorDashboardPage() {
  const session = await requireRole("INSTRUCTOR");
  const [cohorts, sessions] = await Promise.all([
    listInstructorPrograms(session.user.id),
    listUpcomingInstructorSessions(session.user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Instructor overview
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
          Welcome, {session.user.name.split(" ")[0]}.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Coordinate your assigned batches, publish learning updates, and keep
          the next live session visible.
        </p>
      </header>

      <section className="mt-9 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
                Teaching register
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Assigned batches
              </h2>
            </div>
            <Link
              href="/instructor/programs"
              className="text-sm font-semibold text-yaye-blue underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-ink/10 border-t-2 border-ink bg-white">
            {cohorts.slice(0, 4).map((cohort) => (
              <Link
                key={cohort.id}
                href={`/instructor/programs/${cohort.program.id}`}
                className="grid gap-3 px-5 py-5 hover:bg-yaye-pale/50 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {cohort.program.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">{cohort.name}</p>
                </div>
                <span className="font-mono text-[0.62rem] text-yaye-blue">
                  {cohort._count.enrollments} learners
                </span>
              </Link>
            ))}
            {!cohorts.length && (
              <p className="px-5 py-10 text-sm text-muted">
                No batches are assigned to this instructor account.
              </p>
            )}
          </div>
        </div>

        <aside className="border-t-2 border-ink bg-white px-5 py-6">
          <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
            Schedule
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">
            Upcoming sessions
          </h2>
          <div className="mt-4 divide-y divide-ink/10">
            {sessions.map((liveSession) => (
              <div key={liveSession.id} className="py-4 first:pt-0">
                <p className="text-sm font-semibold text-ink">
                  {liveSession.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  <LocalDateTime value={liveSession.startsAt} />
                </p>
                <Link
                  href={`/instructor/programs/${liveSession.cohort.program.id}/sessions`}
                  className="mt-2 inline-block text-xs font-semibold text-yaye-blue"
                >
                  {liveSession.cohort.name} →
                </Link>
              </div>
            ))}
            {!sessions.length && (
              <p className="py-4 text-sm text-muted">
                No upcoming sessions scheduled.
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
