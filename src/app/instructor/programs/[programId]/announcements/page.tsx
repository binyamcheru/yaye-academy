import Link from "next/link";
import { notFound } from "next/navigation";

import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import {
  getInstructorProgram,
  listInstructorAnnouncements,
} from "@/modules/communication/service";

export default async function InstructorAnnouncementsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ created?: string }>;
}>) {
  const session = await requireRole("INSTRUCTOR");
  const { programId } = await params;
  const [workspace, announcements, query] = await Promise.all([
    getInstructorProgram(session.user.id, programId),
    listInstructorAnnouncements(session.user.id, programId),
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
            Batch updates
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Announcements
          </h1>
        </div>
        <Link
          href={`/instructor/programs/${programId}/announcements/new`}
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          New announcement ↗
        </Link>
      </header>
      {query.created === "announcement" && (
        <p
          className="mt-6 border-l-2 border-yaye-teal bg-yaye-pale px-4 py-3 text-sm text-ink"
          role="status"
        >
          Announcement published and enrolled learners notified.
        </p>
      )}
      <section className="mt-8 space-y-5">
        {announcements.map((announcement) => (
          <article
            key={announcement.id}
            className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6"
          >
            <div className="flex flex-wrap justify-between gap-3 text-xs text-muted">
              <span>{announcement.cohort.name}</span>
              <LocalDateTime value={announcement.createdAt} />
            </div>
            <h2 className="mt-3 text-xl font-semibold text-ink">
              {announcement.title}
            </h2>
            <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-muted">
              {announcement.body}
            </p>
          </article>
        ))}
        {!announcements.length && (
          <div className="border border-dashed border-ink/25 bg-white px-5 py-12 text-center text-sm text-muted">
            No announcements have been published for your assigned batches.
          </div>
        )}
      </section>
    </div>
  );
}
