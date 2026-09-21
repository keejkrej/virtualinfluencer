"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const tabs = [
  { slug: "", label: "Overview" },
  { slug: "assets", label: "Assets" },
  { slug: "life", label: "Life" },
  { slug: "generate", label: "Generate" },
  { slug: "publish", label: "Publish" },
  { slug: "settings", label: "Settings" },
];

export function EntityNav({ entityId }: { entityId: string }) {
  const pathname = usePathname();
  const base = `/entities/${entityId}`;

  return (
    <nav className="mb-4 flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active = tab.slug === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Button key={href} variant={active ? "secondary" : "ghost"} size="sm" asChild>
            <Link href={href}>{tab.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
