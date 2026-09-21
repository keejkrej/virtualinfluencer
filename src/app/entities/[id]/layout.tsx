import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { EntityNav } from "@/components/entity-nav";

export default async function EntityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({ where: { id } });
  if (!entity) notFound();

  return (
    <AppShell title={entity.name}>
      <EntityNav entityId={entity.id} />
      {children}
    </AppShell>
  );
}
