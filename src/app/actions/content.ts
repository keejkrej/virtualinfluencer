"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { draftFromLifeEvent } from "@/lib/ai/drafts";
import { generateStill } from "@/lib/ai/images";
import { buildImagePrompt } from "@/lib/prompt";
import { saveAssetRecord } from "@/app/actions/assets";
import { readLocalAsset } from "@/lib/storage";
import { DEFAULT_IMAGE_MODEL } from "@/lib/constants";
import type { ContentStatus } from "@/generated/prisma/client";

async function loadReferenceBytes(entityId: string, assetIds: string[]) {
  const ids = assetIds.length
    ? assetIds
    : (
        await prisma.asset.findMany({
          where: { entityId, canonical: true, kind: "IMAGE" },
          take: 3,
        })
      ).map((asset) => asset.id);

  const assets = await prisma.asset.findMany({
    where: { id: { in: ids }, entityId, kind: "IMAGE" },
  });

  const refs = [];
  for (const asset of assets) {
    try {
      if (asset.storageDriver === "blob" && asset.publicUrl) {
        const res = await fetch(asset.publicUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        refs.push({ bytes: buf, mediaType: asset.mimeType });
      } else {
        const buf = await readLocalAsset(asset.storageKey);
        refs.push({ bytes: buf, mediaType: asset.mimeType });
      }
    } catch {
      // skip unreadable refs
    }
  }
  return refs;
}

export async function generateEntityStill(input: {
  entityId: string;
  scene: string;
  outfit?: string;
  emotion?: string;
  extra?: string;
  model?: string;
  aspectRatio?: `${number}:${number}`;
  referenceIds?: string[];
}) {
  const entity = await prisma.entity.findUniqueOrThrow({
    where: { id: input.entityId },
  });
  const prompt = buildImagePrompt({
    entity,
    scene: input.scene,
    outfit: input.outfit,
    emotion: input.emotion,
    extra: input.extra,
  });
  const references = await loadReferenceBytes(
    input.entityId,
    input.referenceIds ?? [],
  );
  const still = await generateStill({
    prompt,
    model: input.model,
    aspectRatio: input.aspectRatio,
    references,
  });
  const asset = await saveAssetRecord({
    entityId: input.entityId,
    kind: "IMAGE",
    source: "GENERATED",
    filename: `gen-${Date.now()}.png`,
    mimeType: still.mediaType,
    body: still.bytes,
    scene: input.scene,
    outfit: input.outfit,
    emotion: input.emotion,
    prompt,
    model: still.model || input.model || DEFAULT_IMAGE_MODEL,
  });
  return { assetId: asset.id, prompt, model: still.model, base64: still.base64, mediaType: still.mediaType };
}

export async function createDraftFromEvent(eventId: string, model?: string) {
  const event = await prisma.lifeEvent.findUniqueOrThrow({
    where: { id: eventId },
    include: { entity: true },
  });
  const draft = await draftFromLifeEvent({
    entity: event.entity,
    event,
    model,
  });
  const item = await prisma.contentItem.create({
    data: {
      entityId: event.entityId,
      eventId: event.id,
      caption: draft.caption,
      imagePrompt: draft.imagePrompt,
      platforms: draft.platforms.join(","),
      status: "DRAFT",
    },
  });
  revalidatePath(`/entities/${event.entityId}/publish`);
  revalidatePath(`/entities/${event.entityId}/life`);
  return { ...draft, contentId: item.id };
}

export async function createManualDraft(entityId: string, formData: FormData) {
  const caption = String(formData.get("caption") ?? "").trim();
  if (!caption) throw new Error("Caption is required.");
  await prisma.contentItem.create({
    data: {
      entityId,
      caption,
      imagePrompt: String(formData.get("imagePrompt") ?? ""),
      platforms: String(formData.get("platforms") ?? "X"),
      assetId: String(formData.get("assetId") ?? "") || null,
      eventId: String(formData.get("eventId") ?? "") || null,
      status: "DRAFT",
    },
  });
  revalidatePath(`/entities/${entityId}/publish`);
}

export async function attachAssetToContent(contentId: string, assetId: string) {
  const item = await prisma.contentItem.update({
    where: { id: contentId },
    data: { assetId },
  });
  revalidatePath(`/entities/${item.entityId}/publish`);
}

export async function scheduleContent(contentId: string, scheduledAt: string) {
  const item = await prisma.contentItem.update({
    where: { id: contentId },
    data: { status: "SCHEDULED", scheduledAt: new Date(scheduledAt) },
  });
  revalidatePath(`/entities/${item.entityId}/publish`);
}

export async function setContentStatus(contentId: string, status: ContentStatus) {
  const item = await prisma.contentItem.update({
    where: { id: contentId },
    data: { status },
  });
  revalidatePath(`/entities/${item.entityId}/publish`);
}
