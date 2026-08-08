import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = Readonly<{
  className?: string;
  compact?: boolean;
  priority?: boolean;
}>;

export function BrandMark({
  className = "",
  compact = false,
  priority = false,
}: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="Yaye Academy home"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/yayetech-logo.png"
        alt="YayeTech — Endless Possibilities"
        width={1000}
        height={305}
        priority={priority}
        className={compact ? "h-auto w-28" : "h-auto w-36 sm:w-40"}
      />
      <span className="h-8 w-px bg-current opacity-25" aria-hidden="true" />
      <span className="font-mono text-[0.68rem] font-semibold tracking-[0.22em] uppercase sm:text-xs">
        Academy
      </span>
    </Link>
  );
}
