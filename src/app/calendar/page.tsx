import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function CalendarPage() {
  const events = await prisma.lifeEvent.findMany({
    orderBy: { startsAt: "asc" },
    include: { entity: { select: { id: true, name: true } } },
  });

  return (
    <AppShell title="Scheduler">
      {events.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No upcoming life beats</EmptyTitle>
            <EmptyDescription>
              Open an entity workspace and add events on the Life tab.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/entities/${event.entity.id}/life`}>{event.title}</Link>
                </CardTitle>
                <CardDescription>
                  {event.entity.name} · {event.startsAt.toLocaleString()} ·{" "}
                  {event.location || "no location"}
                </CardDescription>
                <div className="flex gap-1">
                  <Badge variant="outline">{event.type.toLowerCase()}</Badge>
                  <Badge>{event.status.toLowerCase()}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
