import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const entities = await prisma.entity.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { assets: true, events: true, contentItems: true } },
    },
  });

  return (
    <AppShell
      title="Entities"
      actions={
        <Button size="sm" nativeButton={false} render={<Link href="/entities/new" />}>
          New entity
        </Button>
      }
    >
      {entities.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Create a virtual entity first</EmptyTitle>
            <EmptyDescription>
              Workflow: create an entity → add canonical reference images → plan
              life events → generate grounded stills → queue posts.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/entities/new" />}>
              Create entity
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entities.map((entity) => (
            <Card key={entity.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/entities/${entity.id}`}>{entity.name}</Link>
                </CardTitle>
                <CardDescription>{entity.bio || "No bio yet."}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Badge variant="outline">{entity._count.assets} assets</Badge>
                <Badge variant="outline">{entity._count.events} life beats</Badge>
                <Badge variant="outline">{entity._count.contentItems} posts</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
