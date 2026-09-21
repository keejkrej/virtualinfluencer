import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NativeSelect } from "@/components/native-select";
import {
  composeVideoStub,
  createStreamSession,
  createVideoProject,
} from "@/app/actions/video";
import { FUTURE_STREAM_TARGETS } from "@/lib/constants";

export default async function StudioPage() {
  const entities = await prisma.entity.findMany({
    orderBy: { name: "asc" },
    include: {
      videoProjects: { orderBy: { createdAt: "desc" } },
      streamSessions: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <AppShell title="Video / streaming (scaffold)">
      <Alert className="mb-4">
        <AlertTitle>Not live yet</AlertTitle>
        <AlertDescription>
          VideoProject and StreamSession are first-class models. Encoding an mp4
          and pushing to Bilibili / YouTube / Twitch needs ffmpeg plus platform
          live keys — documented as TODOs. You can still storyboard a still
          sequence.
        </AlertDescription>
      </Alert>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New video project</CardTitle>
            <CardDescription>Ordered still ids, comma-separated.</CardDescription>
          </CardHeader>
          <CardContent>
            {entities[0] ? (
              <form action={createVideoProject} className="grid gap-2">
                <NativeSelect name="entityId" defaultValue={entities[0].id}>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </NativeSelect>
                <Input name="title" placeholder="Title" />
                <Textarea name="description" placeholder="Description" rows={2} />
                <Input name="assetIds" placeholder="assetId, assetId" />
                <Button type="submit">Create storyboard</Button>
              </form>
            ) : (
              <p className="text-muted-foreground text-sm">Create an entity first.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan a stream</CardTitle>
            <CardDescription>Targets: Bilibili, YouTube, Twitch.</CardDescription>
          </CardHeader>
          <CardContent>
            {entities[0] ? (
              <form action={createStreamSession} className="grid gap-2">
                <NativeSelect name="entityId" defaultValue={entities[0].id}>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </NativeSelect>
                <Input name="title" placeholder="Title" />
                <NativeSelect name="platform" defaultValue="YOUTUBE">
                  {FUTURE_STREAM_TARGETS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </NativeSelect>
                <Input name="startsAt" type="datetime-local" />
                <Textarea name="notes" placeholder="Notes / TODO" rows={2} />
                <Button type="submit">Save session</Button>
              </form>
            ) : (
              <p className="text-muted-foreground text-sm">Create an entity first.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 space-y-2">
        {entities.flatMap((entity) =>
          entity.videoProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  {entity.name} · frames {project.assetIds || "none"}
                </CardDescription>
                <Badge variant="outline">{project.status.toLowerCase()}</Badge>
              </CardHeader>
              <CardContent>
                <form action={composeVideoStub.bind(null, project.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Compose stub (storyboard file)
                  </Button>
                </form>
              </CardContent>
            </Card>
          )),
        )}
        {entities.flatMap((entity) =>
          entity.streamSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  {entity.name} · {session.platform} · {session.notes}
                </CardDescription>
                <Badge>{session.status.toLowerCase()}</Badge>
              </CardHeader>
            </Card>
          )),
        )}
      </div>
    </AppShell>
  );
}
