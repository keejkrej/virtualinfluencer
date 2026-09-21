"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { storeAsset, deleteAssetObject } from "@/lib/storage";
import type { AssetKind, AssetSource } from "@/generated/prisma/client";

export async function saveAssetRecord(input: {
  entityId: string;
  kind?: AssetKind;
  source?: AssetSource;
  filename: string;
  mimeType: string;
  body: Buffer;
  tags?: string;
  scene?: string;
  outfit?: string;
  emotion?: string;
  canonical?: boolean;
  prompt?: string;
  model?: string;
}) {
  const id = crypto.randomUUID();
  const key = `${input.entityId}/${id}-${input.filename.replace(/[^\w.-]+/g, "_")}`;
  const stored = await storeAsset({
    key,
    body: input.body,
    contentType: input.mimeType,
    filename: input.filename,
  });

  const asset = await prisma.asset.create({
    data: {
      id,
      entityId: input.entityId,
      kind: input.kind ?? "IMAGE",
      source: input.source ?? "UPLOAD",
      filename: input.filename,
      mimeType: input.mimeType,
      storageKey: stored.key,
      storageDriver: stored.driver,
      publicUrl: stored.publicUrl,
      tags: input.tags ?? "",
      scene: input.scene,
      outfit: input.outfit,
      emotion: input.emotion,
      canonical: input.canonical ?? false,
      prompt: input.prompt,
      model: input.model,
    },
  });

  revalidatePath(`/entities/${input.entityId}`);
  revalidatePath(`/entities/${input.entityId}/assets`);
  revalidatePath(`/entities/${input.entityId}/generate`);
  return asset;
}

export async function updateAssetMeta(
  assetId: string,
  data: {
    tags?: string;
    scene?: string;
    outfit?: string;
    emotion?: string;
    canonical?: boolean;
  },
) {
  const asset = await prisma.asset.update({ where: { id: assetId }, data });
  revalidatePath(`/entities/${asset.entityId}/assets`);
}

export async function deleteAsset(assetId: string) {
  const asset = await prisma.asset.delete({ where: { id: assetId } });
  await deleteAssetObject(asset.storageKey, asset.storageDriver);
  revalidatePath(`/entities/${asset.entityId}/assets`);
}
