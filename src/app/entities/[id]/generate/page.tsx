import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GenerateStudio } from "@/components/generate-studio";
import { hasOpenRouterKey, configuredModels } from "@/lib/ai/provider";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: {
      assets: {
        where: { kind: "IMAGE" },
        select: { id: true, filename: true, canonical: true },
      },
    },
  });
  if (!entity) notFound();
  const models = configuredModels();

  return (
    <GenerateStudio
      entityId={entity.id}
      entityName={entity.name}
      openRouterConfigured={hasOpenRouterKey()}
      defaultTextModel={models.text}
      defaultImageModel={models.image}
      assets={entity.assets}
    />
  );
}
