"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemDescription,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@/components/ai-elements/queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publishContent } from "@/app/actions/publish";
import { scheduleContent, setContentStatus } from "@/app/actions/content";
import type { ContentStatus } from "@/generated/prisma/client";

type Item = {
  id: string;
  caption: string;
  imagePrompt: string;
  platforms: string;
  status: ContentStatus;
  scheduledAt: Date | string | null;
  error: string | null;
  platformLog: string;
};

function groupLabel(status: ContentStatus) {
  if (status === "DRAFT") return "Drafts";
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "PUBLISHED") return "Published";
  if (status === "FAILED") return "Failed";
  return "Publishing";
}

export function PublishQueue({ items }: { items: Item[] }) {
  const [pending, startTransition] = useTransition();

  const groups = ["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"] as const;

  return (
    <Queue>
      {groups.map((status) => {
        const rows = items.filter((item) => item.status === status);
        if (!rows.length) return null;
        return (
          <QueueSection key={status} defaultOpen={status === "DRAFT" || status === "SCHEDULED"}>
            <QueueSectionTrigger>
              <QueueSectionLabel count={rows.length} label={groupLabel(status)} />
            </QueueSectionTrigger>
            <QueueSectionContent>
              <QueueList>
                {rows.map((item) => (
                  <QueueItem key={item.id}>
                    <div className="flex items-start gap-2">
                      <QueueItemIndicator completed={item.status === "PUBLISHED"} />
                      <div className="min-w-0 flex-1">
                        <QueueItemContent>{item.caption}</QueueItemContent>
                        <QueueItemDescription>
                          {item.platforms} · {item.imagePrompt.slice(0, 80) || "No image prompt"}
                        </QueueItemDescription>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline">{item.status.toLowerCase()}</Badge>
                          {item.error ? (
                            <Badge variant="destructive">see log</Badge>
                          ) : null}
                        </div>
                        {item.error ? (
                          <p className="text-muted-foreground mt-1 text-xs">{item.error}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.status === "DRAFT" || item.status === "FAILED" ? (
                            <Button
                              size="xs"
                              disabled={pending}
                              onClick={() =>
                                startTransition(async () => {
                                  const log = await publishContent(item.id);
                                  toast.message(
                                    log.map((entry) => `${entry.platform}: ${entry.message}`).join(" · "),
                                  );
                                })
                              }
                            >
                              Publish now
                            </Button>
                          ) : null}
                          {item.status === "DRAFT" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={pending}
                              onClick={() =>
                                startTransition(async () => {
                                  const when = new Date(Date.now() + 1000 * 60 * 60).toISOString();
                                  await scheduleContent(item.id, when);
                                })
                              }
                            >
                              Schedule +1h
                            </Button>
                          ) : null}
                          {item.status === "SCHEDULED" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={pending}
                              onClick={() =>
                                startTransition(async () => {
                                  await setContentStatus(item.id, "DRAFT");
                                })
                              }
                            >
                              Unschedule
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </QueueItem>
                ))}
              </QueueList>
            </QueueSectionContent>
          </QueueSection>
        );
      })}
    </Queue>
  );
}
