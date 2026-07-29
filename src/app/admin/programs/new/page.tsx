import Link from "next/link";

import { ProgramForm } from "@/components/admin/program-form";
import { requireRole } from "@/modules/auth/session";

export default async function NewProgramPage() {
  await requireRole("ADMIN");
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/programs"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Programs
      </Link>
      <header className="mt-6 border-b border-ink/15 pb-7">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          New catalog record
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          Create a program
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          New programs begin as drafts. Curriculum and an instructed batch are
          required before publication.
        </p>
      </header>
      <div className="mt-8">
        <ProgramForm />
      </div>
    </div>
  );
}
