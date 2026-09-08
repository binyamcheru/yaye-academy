import Link from "next/link";

import { EnrollmentCard } from "@/components/learner/enrollment-card";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import { getLearnerCommunicationSummary } from "@/modules/communication/service";
import { listLearnerEnrollments } from "@/modules/enrollments/service";

export default async function LearnerDashboardPage() {
  const session = await requireRole("LEARNER");
  const [enrollments, communication] = await Promise.all([
    listLearnerEnrollments(session.user.id),
    getLearnerCommunicationSummary(session.user.id),
  ]);
  const activeCount = enrollments.filter(
    (item) => item.status === "ACTIVE",
  ).length;
  const completedCount = enrollments.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="grid gap-8 border-b-2 border-ink pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Learner overview
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
            Welcome back, {session.user.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Continue from your current lesson and keep every completed step
            visible.
          </p>
        </div>
        <Link
          href="/programs"
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Browse programs ↗
        </Link>
      </header>

      <dl className="mt-7 grid border-y border-ink/15 bg-white sm:grid-cols-4">
        {[
          ["Active programs", String(activeCount)],
          ["Completed", String(completedCount)],
          ["Learning record", `${enrollments.length} total`],
          ["Notifications", `${communication.unreadCount} unread`],
        ].map(([term, value]) => (
          <div
            key={term}
            className="border-ink/15 px-5 py-5 sm:border-r sm:last:border-r-0"
          >
            <dt className="font-mono text-[0.6rem] tracking-[0.1em] text-muted uppercase">
              {term}
            </dt>
            <dd className="mt-2 text-xl font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Continue learning
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              My programs
            </h2>
          </div>
          {enrollments.length > 0 && (
            <Link
              href="/dashboard/my-learning"
              className="text-sm font-semibold text-yaye-blue underline"
            >
              View all
            </Link>
          )}
        </div>

        {enrollments.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {enrollments.slice(0, 2).map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                program={enrollment.cohort.program}
                batchName={enrollment.cohort.name}
                status={enrollment.status}
                progress={enrollment.progress}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-ink/25 bg-white px-5 py-12 text-center">
            <h2 className="text-xl font-semibold text-ink">
              No active learning yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Start with a published free program from the academy catalog.
            </p>
            <Link
              href="/programs"
              className="mt-5 inline-block bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Find a program
            </Link>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
                Schedule
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Upcoming sessions
              </h2>
            </div>
          </div>
          <div className="divide-y divide-ink/10 bg-white px-5">
            {communication.upcomingSessions.map((liveSession) => (
              <div
                key={liveSession.id}
                className="grid gap-3 py-5 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-ink">{liveSession.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {liveSession.cohort.program.title} ·{" "}
                    {liveSession.cohort.name}
                  </p>
                  <p className="mt-2 font-mono text-xs text-yaye-blue">
                    <LocalDateTime value={liveSession.startsAt} />
                  </p>
                </div>
                <Link
                  href={`/dashboard/programs/${liveSession.programId}/sessions`}
                  className="self-start text-xs font-semibold text-yaye-blue underline"
                >
                  Session details
                </Link>
              </div>
            ))}
            {!communication.upcomingSessions.length && (
              <p className="py-8 text-sm text-muted">
                No upcoming sessions are scheduled.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
                Batch notes
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Recent announcements
              </h2>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-sm font-semibold text-yaye-blue underline"
            >
              Notifications
            </Link>
          </div>
          <div className="divide-y divide-ink/10 bg-white px-5">
            {communication.recentAnnouncements.map((announcement) => (
              <article key={announcement.id} className="py-5">
                <p className="font-semibold text-ink">{announcement.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {announcement.body}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {announcement.cohort.program.title} ·{" "}
                  {announcement.author.name}
                </p>
              </article>
            ))}
            {!communication.recentAnnouncements.length && (
              <p className="py-8 text-sm text-muted">
                No announcements have been published.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
