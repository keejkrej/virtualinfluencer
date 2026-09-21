"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BroadcastIcon,
  CalendarBlankIcon,
  PlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Entities", icon: UsersThreeIcon },
  { href: "/calendar", label: "Scheduler", icon: CalendarBlankIcon },
  { href: "/studio", label: "Video / Stream", icon: BroadcastIcon },
];

export function AppSidebar({
  entities,
}: {
  entities: { id: string; name: string }[];
}) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3">
        <Link href="/" className="font-heading text-sm">
          VirtualInfluencer
        </Link>
        <p className="text-muted-foreground text-xs">
          Consistent characters, not one-off images.
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    isActive={
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href)
                    }
                    asChild
                  >
                    <Link href={link.href}>
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/entities/new">
                    <PlusIcon />
                    <span>New entity</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {entities.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Entities</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {entities.map((entity) => (
                  <SidebarMenuItem key={entity.id}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(`/entities/${entity.id}`)}
                      asChild
                    >
                      <Link href={`/entities/${entity.id}`}>{entity.name}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="flex-row items-center justify-between px-2">
        <span className="text-muted-foreground px-1 text-xs">Lyra</span>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
