"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "总览" },
  { href: "/syllabus/", label: "考点" },
  { href: "/mistakes/", label: "错题" },
  { href: "/feynman/", label: "讲题" },
  { href: "/essay/", label: "英文" },
  { href: "/chinese/", label: "华文" },
  { href: "/flashcards/", label: "背诵" },
  { href: "/papers/", label: "真题" },
  { href: "/data/", label: "备份" },
];

const SEGMENTS = LINKS.map((l) => l.href.replace(/\//g, "")).filter(Boolean);

/**
 * Compares by route segment rather than by full path, so the active tab stays
 * correct under a GitHub Pages basePath — next/link prefixes hrefs but
 * usePathname's treatment of the prefix is not something to bet the nav on.
 */
function activeSegment(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  return SEGMENTS.includes(last) ? last : "";
}

export default function Nav() {
  const current = activeSegment(usePathname());

  return (
    <nav className="sticky top-0 z-20 border-b bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-2 py-2">
        {LINKS.map((link) => {
          const segment = link.href.replace(/\//g, "");
          const active = segment === current;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
