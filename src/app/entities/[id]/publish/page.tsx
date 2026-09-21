import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublishQueue } from "@/components/publish-queue";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createManualDraft } from "@/app/actions/content";
import { listAdapters } from "@/lib/social";
import { NativeSelect } from "@/components/native-select";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      contentItems: { orderBy: { createdAt: "desc" } },
      accounts: true,
      assets: { orderBy: { createdAt: "desc" }, take: 20 },
      events: { orderBy: { startsAt: "desc" }, take: 20 },
    },
  });
  if (!entity) notFound();

  const adapters = listAdapters();
  const create = createManualDraft.bind(null, entity.id);

  return (
    <div className="grid gap-4 lg:grid-cols-[24rem_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Queue a draft</CardTitle>
            <CardDescription>
              Caption + optional image prompt. Attach a generated still before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={create} className="grid gap-2">
              <Textarea name="caption" placeholder="Caption" required rows={4} />
              <Textarea name="imagePrompt" placeholder="Image prompt (optional)" rows={3} />
              <NativeSelect name="platforms" defaultValue="X">
                <option value="X">X</option>
                <option value="X,XIAOHONGSHU">X + Xiaohongshu</option>
                <option value="X,TIKTOK">X + TikTok</option>
                <option value="X,BILIBILI">X + Bilibili</option>
                <option value="XIAOHONGSHU">Xiaohongshu</option>
                <option value="TIKTOK">TikTok</option>
                <option value="BILIBILI">Bilibili</option>
              </NativeSelect>
              <NativeSelect name="assetId" defaultValue="">
                <option value="">No asset</option>
                {entity.assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.filename}
                  </option>
                ))}
              </NativeSelect>
              <NativeSelect name="eventId" defaultValue="">
                <option value="">No life event</option>
                {entity.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </NativeSelect>
              <Button type="submit">Save draft</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Adapters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {adapters.map((adapter) => {
              const account = entity.accounts.find((item) => item.platform === adapter.platform);
              return (
                <div key={adapter.platform} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{adapter.label}</span>
                    <Badge variant={adapter.live ? "default" : "outline"}>
                      {adapter.live ? "live" : "not yet live"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{adapter.docs}</p>
                  {account?.handle ? (
                    <p className="text-xs">{account.handle}</p>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      {entity.contentItems.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nothing in the queue</EmptyTitle>
            <EmptyDescription>
              Draft from a life event, or write a caption here. X posts if credentials
              are set; other platforms stay stubbed.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <PublishQueue items={entity.contentItems} />
      )}
    </div>
  );
}
