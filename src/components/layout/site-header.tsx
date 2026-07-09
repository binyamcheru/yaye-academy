import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/15 bg-paper">
      <div className="bg-ink text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-5 font-mono text-[0.62rem] tracking-[0.12em] uppercase sm:px-8">
          <span>Yaye Tech · Addis Ababa</span>
          <span className="hidden text-white/70 sm:inline">
            Training the people who build the future
          </span>
        </div>
      </div>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <BrandMark priority className="text-ink" />

        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink md:flex">
          <Link href="/programs" className="nav-link">
            Programs
          </Link>
          <Link href="/#model" className="nav-link">
            How it works
          </Link>
          <Link href="/#why-yaye" className="nav-link">
            Why Yaye
          </Link>
          <Link href="/login" className="border-l border-ink/20 pl-7">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-ink px-4 py-3 text-white transition-colors hover:bg-yaye-blue"
          >
            Join academy
          </Link>
        </nav>

        <Link
          href="/login"
          className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] text-yaye-blue uppercase md:hidden"
        >
          Log in →
        </Link>
      </div>
    </header>
  );
}
