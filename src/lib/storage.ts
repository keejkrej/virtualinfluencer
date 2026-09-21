import { put, del } from "@vercel/blob";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type StoredObject = {
  key: string;
  driver: "local" | "blob";
  publicUrl: string | null;
};

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function localAssetPath(key: string) {
  return join(process.cwd(), "data", "assets", key);
}

export async function storeAsset(input: {
  key: string;
  body: Buffer;
  contentType: string;
  filename: string;
}): Promise<StoredObject> {
  if (blobEnabled()) {
    const blob = await put(input.key, input.body, {
      access: "public",
      contentType: input.contentType,
      addRandomSuffix: false,
    });
    return { key: blob.pathname ?? input.key, driver: "blob", publicUrl: blob.url };
  }

  const fullPath = localAssetPath(input.key);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, input.body);
  return { key: input.key, driver: "local", publicUrl: null };
}

export async function readLocalAsset(key: string): Promise<Buffer> {
  return readFile(localAssetPath(key));
}

export async function deleteAssetObject(key: string, driver: string) {
  if (driver === "blob") {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return;
    await del(key);
    return;
  }
  try {
    await unlink(localAssetPath(key));
  } catch {
    // missing file is fine
  }
}

export function assetPublicPath(asset: {
  id: string;
  publicUrl: string | null;
  storageDriver: string;
}) {
  if (asset.publicUrl) return asset.publicUrl;
  return `/api/assets/${asset.id}`;
}
