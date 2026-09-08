import Link from "next/link";
import { notFound } from "next/navigation";

import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import {
  getInstructorProgram,
  listInstructorSessions,
} from "@/modules/communication/service";

export default async function InstructorSessionsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ created?: string }>;
}>) {
  const session = await requireRole("INSTRUCTOR");
  const { programId } = await params;
  const [workspace, sessions, query] = await Promise.all([
    getInstructorProgram(session.user.id, programId),
    listInstructorSessions(session.user.id, programId),
    searchParams,
  ]);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/instructor/programs/${programId}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← {workspace.program.title}
      </Link>
      <header className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-8">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Live delivery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Sessions
          </h1>
        </div>
        <Link
          href={`/instructor/programs/${programId}/sessions/new`}
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Schedule session ↗
        </Link>
      </header>
      {query.created === "session" && (
        <p
          className="mt-6 border-l-2 border-yaye-teal bg-yaye-pale px-4 py-3 text-sm text-ink"
          role="status"
        >
          Session published and enrolled learners notified.
        </p>
      )}
      <section className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white">
        {sessions.map((liveSession) => (
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
              <p className="text-xs text-muted">{liveSession.cohort.name}</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">
                {liveSession.title}
              </h2>
              {liveSession.description && (
                <p className="mt-2 text-sm leading-6 text-muted">
                  {liveSession.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-yaye-blue">
                {liveSession.recordingUrl && (
                  <a href={liveSession.recordingUrl}>Recording ↗</a>
                )}
                {liveSession.slidesUrl && (
                  <a href={liveSession.slidesUrl}>Slides ↗</a>
                )}
                {liveSession.resourceUrl && (
                  <a href={liveSession.resourceUrl}>Resource ↗</a>
                )}
              </div>
            </div>
            <a
              href={liveSession.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="self-start bg-yaye-blue px-4 py-3 text-sm font-semibold text-white"
            >
              Open meeting ↗
            </a>
          </article>
        ))}
        {!sessions.length && (
          <p className="px-5 py-12 text-sm text-muted">
            No sessions scheduled for your assigned batches.
          </p>
        )}
      </section>
    </div>
  );
}
