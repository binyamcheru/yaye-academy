"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceNav({
  items,
}: Readonly<{
  items: ReadonlyArray<Readonly<{ href: string; label: string }>>;
}>) {
  const pathname = usePathname();

  return (
    <nav className="mt-7 space-y-1 text-sm">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" &&
            item.href !== "/instructor" &&
            item.href !== "/dashboard" &&
            pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block border-l-2 px-4 py-3 font-semibold transition-colors ${
              isActive
                ? "border-yaye-teal bg-white/7 text-white"
                : "border-transparent text-white/65 hover:border-white/30 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
