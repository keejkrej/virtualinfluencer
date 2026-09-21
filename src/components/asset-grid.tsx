import { assetPublicPath } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteAsset, updateAssetMeta } from "@/app/actions/assets";
import { AssetUploadForm } from "@/components/asset-upload";

type AssetRow = {
  id: string;
  filename: string;
  publicUrl: string | null;
  storageDriver: string;
  source: string;
  tags: string;
  scene: string | null;
  outfit: string | null;
  emotion: string | null;
  canonical: boolean;
  mimeType: string;
};

export function AssetGrid({
  assets,
}: {
  assets: AssetRow[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id}>
          <CardHeader>
            <CardTitle className="truncate text-xs">{asset.filename}</CardTitle>
            <CardDescription className="flex flex-wrap gap-1">
              <Badge variant="outline">{asset.source.toLowerCase()}</Badge>
              {asset.canonical ? <Badge>canonical</Badge> : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {asset.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assetPublicPath(asset)}
                alt={asset.filename}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <p className="text-muted-foreground text-xs">{asset.mimeType}</p>
            )}
            <p className="text-muted-foreground text-xs">
              {[asset.scene, asset.outfit, asset.emotion, asset.tags]
                .filter(Boolean)
                .join(" · ") || "Untagged"}
            </p>
            <div className="flex flex-wrap gap-1">
              <form
                action={async () => {
                  "use server";
                  await updateAssetMeta(asset.id, { canonical: !asset.canonical });
                }}
              >
                <Button type="submit" size="xs" variant="outline">
                  {asset.canonical ? "Unmark canonical" : "Mark canonical"}
                </Button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteAsset(asset.id);
                }}
              >
                <Button type="submit" size="xs" variant="destructive">
                  Delete
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { AssetUploadForm };
