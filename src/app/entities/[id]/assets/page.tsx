import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AssetGrid, AssetUploadForm } from "@/components/asset-grid";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await prisma.entity.findUnique({
    where: { id },
    include: { assets: { orderBy: { createdAt: "desc" } } },
  });
  if (!entity) notFound();

  return (
    <div className="space-y-4">
      <AssetUploadForm entityId={entity.id} />
      {entity.assets.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No assets yet</EmptyTitle>
            <EmptyDescription>
              Upload a canonical face/body reference before generating. Tag by
              scene, outfit, and emotion.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <AssetGrid assets={entity.assets} />
      )}
    </div>
  );
}
