import Link from "next/link";
import { notFound } from "next/navigation";

import { AnnouncementForm } from "@/components/instructor/announcement-form";
import { requireRole } from "@/modules/auth/session";
import { getInstructorProgram } from "@/modules/communication/service";

export default async function NewAnnouncementPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("INSTRUCTOR");
  const { programId } = await params;
  const workspace = await getInstructorProgram(session.user.id, programId);
  if (!workspace) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/instructor/programs/${programId}/announcements`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Announcements
      </Link>
      <header className="mt-6 border-b-2 border-ink pb-7">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          {workspace.program.title}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Publish an announcement
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Notify active learners in one assigned batch with a concise update.
        </p>
      </header>
      <div className="mt-8">
        <AnnouncementForm programId={programId} cohorts={workspace.cohorts} />
      </div>
    </div>
  );
}
