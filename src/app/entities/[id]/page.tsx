import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { hasOpenRouterKey } from "@/lib/ai/provider";

export default async function EntityOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      assets: { take: 6, orderBy: { createdAt: "desc" } },
      events: { take: 5, orderBy: { startsAt: "asc" } },
      contentItems: { take: 5, orderBy: { createdAt: "desc" } },
      accounts: true,
    },
  });
  if (!entity) notFound();

  const steps = [
    { ok: true, label: "Entity created", href: `/entities/${id}/settings` },
    {
      ok: entity.assets.some((asset) => asset.canonical) || entity.assets.length > 0,
      label: "Add canonical references",
      href: `/entities/${id}/assets`,
    },
    {
      ok: entity.events.length > 0,
      label: "Plan life events",
      href: `/entities/${id}/life`,
    },
    {
      ok: entity.assets.some((asset) => asset.source === "GENERATED"),
      label: "Generate grounded stills",
      href: `/entities/${id}/generate`,
    },
    {
      ok: entity.contentItems.length > 0,
      label: "Queue a post",
      href: `/entities/${id}/publish`,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Consistency profile</CardTitle>
            <CardDescription>
              Always-on prompt context for generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{entity.bio || "Add a bio in Settings."}</p>
            <p className="text-muted-foreground">{entity.canonicalDescription}</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">{entity.locale}</Badge>
              <Badge variant="outline">{entity.timezone}</Badge>
              <Badge variant="outline">{entity.languages}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center justify-between gap-2">
                <span className="text-sm">
                  {index + 1}. {step.label}
                </span>
                <Button
                  size="xs"
                  variant={step.ok ? "secondary" : "outline"}
                  nativeButton={false}
                  render={<Link href={step.href} />}
                >
                  {step.ok ? "Done" : "Next"}
                </Button>
              </div>
            ))}
            {!hasOpenRouterKey() ? (
              <p className="text-muted-foreground text-xs">
                OPENROUTER_API_KEY is not set — generation stays disabled until you add it.
              </p>
            ) : null}
          </CardContent>
        </Card>
        {entity.events.length === 0 && entity.assets.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>This entity has no life yet</EmptyTitle>
              <EmptyDescription>
                Add a reference image, then a life beat. Generation without refs
                drifts.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                nativeButton={false}
                render={<Link href={`/entities/${id}/assets`} />}
              >
                Add references
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming life</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {entity.events.length === 0 ? (
              <p className="text-muted-foreground">No events yet.</p>
            ) : (
              entity.events.map((event) => (
                <div key={event.id}>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {event.type.toLowerCase()} · {event.status.toLowerCase()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connectors</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {entity.accounts.map((account) => (
              <Badge key={account.id} variant={account.status === "LIVE" ? "default" : "outline"}>
                {account.platform} {account.status === "STUB" ? "stub" : ""}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
