import { prisma } from "@/lib/db";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export async function AppShell({
  children,
  title,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}) {
  const entities = await prisma.entity.findMany({
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AppSidebar entities={entities} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <h1 className="truncate text-sm font-medium">{title ?? "VirtualInfluencer"}</h1>
            {actions}
          </div>
        </header>
        <div className="flex-1 p-4">{children}</div>
      </SidebarInset>
    </>
  );
}
