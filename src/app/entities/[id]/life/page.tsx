import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/native-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createLifeEvent,
  deleteLifeEvent,
  updateLifeEventStatus,
} from "@/app/actions/events";
import { createDraftFromEvent } from "@/app/actions/content";
import { LIFE_EVENT_STATUSES, LIFE_EVENT_TYPES } from "@/lib/constants";
import { hasOpenRouterKey } from "@/lib/ai/provider";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function LifePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: { events: { orderBy: { startsAt: "asc" } } },
  });
  if (!entity) notFound();

  const create = createLifeEvent.bind(null, entity.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>New life beat</CardTitle>
          <CardDescription>Shopping, dining, travel — keep it PG-13.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={create} className="grid gap-2">
            <NativeSelect name="type" defaultValue="HOBBY">
              {LIFE_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.toLowerCase()}
                </option>
              ))}
            </NativeSelect>
            <Input name="title" placeholder="Title" required />
            <Textarea name="description" placeholder="What happens" rows={3} />
            <Input name="location" placeholder="Location" />
            <Input name="startsAt" type="datetime-local" />
            <Input name="mood" placeholder="Mood" />
            <Input name="companions" placeholder="Companions" />
            <NativeSelect name="status" defaultValue="PLANNED">
              {LIFE_EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.toLowerCase()}
                </option>
              ))}
            </NativeSelect>
            <Button type="submit">Add event</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {entity.events.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No life trajectory yet</EmptyTitle>
              <EmptyDescription>
                Plan beats first. Content should come from a life, not a random prompt.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          entity.events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {event.location || "No location"} ·{" "}
                  {event.startsAt.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{event.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{event.type.toLowerCase()}</Badge>
                  <Badge>{event.status.toLowerCase()}</Badge>
                  {event.mood ? <Badge variant="secondary">{event.mood}</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  {LIFE_EVENT_STATUSES.map((status) => (
                    <form
                      key={status}
                      action={async () => {
                        "use server";
                        await updateLifeEventStatus(event.id, status);
                      }}
                    >
                      <Button size="xs" variant="outline" type="submit">
                        {status.toLowerCase()}
                      </Button>
                    </form>
                  ))}
                  <form
                    action={async () => {
                      "use server";
                      if (!hasOpenRouterKey()) return;
                      await createDraftFromEvent(event.id);
                    }}
                  >
                    <Button size="xs" type="submit">
                      Draft content
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await deleteLifeEvent(event.id);
                    }}
                  >
                    <Button size="xs" variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
