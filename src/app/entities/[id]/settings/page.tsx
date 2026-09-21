import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { EntityForm } from "@/components/entity-form";
import { deleteEntity, updateEntity, updateSocialHandle } from "@/app/actions/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: { accounts: true },
  });
  if (!entity) notFound();

  const save = updateEntity.bind(null, entity.id);

  return (
    <div className="space-y-6">
      <EntityForm
        action={save}
        submitLabel="Save identity"
        defaults={{
          name: entity.name,
          bio: entity.bio,
          personality: entity.personality,
          canonicalDescription: entity.canonicalDescription,
          faceNotes: entity.faceNotes,
          bodyNotes: entity.bodyNotes,
          wardrobePalette: entity.wardrobePalette,
          styleDo: entity.styleDo,
          styleDont: entity.styleDont,
          locale: entity.locale,
          timezone: entity.timezone,
          languages: entity.languages,
        }}
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Social handles</CardTitle>
          <CardDescription>No secrets here — tokens live in env vars.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const account = entity.accounts.find((item) => item.platform === platform);
            const saveHandle = updateSocialHandle.bind(null, entity.id, platform);
            return (
              <form key={platform} action={saveHandle} className="flex gap-2">
                <Input name="handle" defaultValue={account?.handle ?? ""} placeholder={platform} />
                <Button type="submit" variant="outline">
                  Save
                </Button>
              </form>
            );
          })}
        </CardContent>
      </Card>
      <form
        action={async () => {
          "use server";
          await deleteEntity(entity.id);
          redirect("/");
        }}
      >
        <Button variant="destructive" type="submit">
          Delete entity
        </Button>
      </form>
    </div>
  );
}
