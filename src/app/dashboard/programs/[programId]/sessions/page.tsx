import Link from "next/link";
import { notFound } from "next/navigation";

import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import { getLearnerSessions } from "@/modules/communication/service";

export default async function LearnerSessionsPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId } = await params;
  const workspace = await getLearnerSessions(session.user.id, programId);
  if (!workspace) notFound();
  const now = new Date();
  const upcoming = workspace.sessions.filter((item) => item.startsAt >= now);
  const past = workspace.sessions
    .filter((item) => item.startsAt < now)
    .reverse();

  const sessionRows = (items: typeof workspace.sessions) =>
    items.map((liveSession) => (
      <article
        key={liveSession.id}
        className="grid gap-5 px-5 py-6 lg:grid-cols-[13rem_1fr_auto]"
      >
        <div className="font-mono text-xs text-yaye-blue">
          <LocalDateTime value={liveSession.startsAt} />
          {liveSession.endsAt && (
            <p className="mt-2 text-muted">
              Ends <LocalDateTime value={liveSession.endsAt} />
            </p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink">
            {liveSession.title}
          </h3>
          {liveSession.description && (
            <p className="mt-2 text-sm leading-6 text-muted">
              {liveSession.description}
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            Published by {liveSession.createdBy.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-yaye-blue">
            {liveSession.recordingUrl && (
              <a
                href={liveSession.recordingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Recording ↗
              </a>
            )}
            {liveSession.slidesUrl && (
              <a href={liveSession.slidesUrl} target="_blank" rel="noreferrer">
                Slides ↗
              </a>
            )}
            {liveSession.resourceUrl && (
              <a
                href={liveSession.resourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Resource ↗
              </a>
            )}
          </div>
        </div>
        {liveSession.startsAt >= now && (
          <a
            href={liveSession.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="self-start bg-yaye-blue px-4 py-3 text-sm font-semibold text-white hover:bg-ink"
          >
            Join session ↗
          </a>
        )}
      </article>
    ));

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/dashboard/programs/${programId}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← {workspace.enrollment.cohort.program.title}
      </Link>
      <header className="mt-6 border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          {workspace.enrollment.cohort.name}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Live sessions
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Session times are displayed in your current device time zone. Meeting
          links open the instructor&apos;s external Meet or Zoom room.
        </p>
      </header>
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-ink">Upcoming</h2>
        <div className="mt-4 divide-y divide-ink/10 border-t-2 border-ink bg-white">
          {sessionRows(upcoming)}
          {!upcoming.length && (
            <p className="px-5 py-10 text-sm text-muted">
              No upcoming sessions are scheduled.
            </p>
          )}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Past sessions</h2>
        <div className="mt-4 divide-y divide-ink/10 border-t-2 border-ink bg-white">
          {sessionRows(past)}
          {!past.length && (
            <p className="px-5 py-10 text-sm text-muted">
              No past sessions yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
