import Link from "next/link";

export function AcademyCta() {
  return (
    <section className="bg-yaye-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:py-20">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold tracking-[0.15em] text-yaye-pale uppercase">
            Your academy account
          </p>
          <h2 className="mt-5 max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-5xl">
            Be ready when the first programs open.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70">
            Registration creates a learner account. Enrollment becomes available
            program by program after curriculum, instructor, and batch details
            are published.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            href="/register"
            className="bg-white px-5 py-4 text-sm font-semibold text-ink transition-colors hover:bg-yaye-pale"
          >
            Create learner account ↗
          </Link>
          <Link
            href="/login"
            className="border border-white/40 px-5 py-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
