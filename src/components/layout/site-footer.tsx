import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/15 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <BrandMark compact className="text-ink" />
          <p className="mt-5 max-w-md text-sm leading-6 text-muted">
            Practical technical training from Yaye Tech—built around structured
            learning, instructor guidance, and work learners can demonstrate.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <p className="font-mono text-[0.62rem] font-semibold tracking-[0.12em] text-yaye-blue uppercase">
            Explore
          </p>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-ink">
            <Link href="/programs" className="hover:text-yaye-blue">
              Programs
            </Link>
            <Link href="/#model" className="hover:text-yaye-blue">
              Learning model
            </Link>
            <Link href="/#instructors" className="hover:text-yaye-blue">
              Instructor standard
            </Link>
            <Link href="/register" className="hover:text-yaye-blue">
              Join the academy
            </Link>
          </div>
        </nav>

        <div className="font-mono text-[0.68rem] leading-6 tracking-[0.08em] text-muted uppercase lg:text-right">
          <a
            href="https://yayetech.com/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-yaye-blue hover:underline"
          >
            Yaye Tech ↗
          </a>
          <p>Addis Ababa, Ethiopia</p>
          <p>&copy; {new Date().getFullYear()} Yaye Tech</p>
        </div>
      </div>
    </footer>
  );
}
