"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAdapter } from "@/lib/social";
import { readLocalAsset } from "@/lib/storage";
import { splitCsv } from "@/lib/constants";
import type { SocialPlatformId } from "@/lib/social/types";

export async function publishContent(contentId: string) {
  const item = await prisma.contentItem.findUniqueOrThrow({
    where: { id: contentId },
    include: { asset: true },
  });

  await prisma.contentItem.update({
    where: { id: contentId },
    data: { status: "PUBLISHING", error: null },
  });

  let media: { bytes: Buffer; mimeType: string; filename: string } | null = null;
  if (item.asset) {
    try {
      if (item.asset.storageDriver === "blob" && item.asset.publicUrl) {
        const res = await fetch(item.asset.publicUrl);
        media = {
          bytes: Buffer.from(await res.arrayBuffer()),
          mimeType: item.asset.mimeType,
          filename: item.asset.filename,
        };
      } else {
        media = {
          bytes: await readLocalAsset(item.asset.storageKey),
          mimeType: item.asset.mimeType,
          filename: item.asset.filename,
        };
      }
    } catch {
      media = null;
    }
  }

  const platforms = splitCsv(item.platforms) as SocialPlatformId[];
  const log: {
    platform: string;
    ok: boolean;
    live: boolean;
    message: string;
    externalId?: string;
  }[] = [];

  for (const platform of platforms) {
    const adapter = getAdapter(platform);
    if (!adapter) {
      log.push({
        platform,
        ok: false,
        live: false,
        message: "Unknown platform adapter.",
      });
      continue;
    }
    const result = await adapter.publish({ caption: item.caption, media });
    log.push(result);
  }

  const anyLiveSuccess = log.some((entry) => entry.ok && entry.live);
  const allFailed = log.every((entry) => !entry.ok);
  const onlyStubs = log.every((entry) => !entry.live);

  await prisma.contentItem.update({
    where: { id: contentId },
    data: {
      platformLog: JSON.stringify(log),
      status: anyLiveSuccess ? "PUBLISHED" : allFailed && !onlyStubs ? "FAILED" : "PUBLISHED",
      publishedAt: new Date(),
      error: onlyStubs
        ? "Queued through stub adapters (or posted to X if configured). See per-platform log."
        : log.filter((entry) => !entry.ok).map((entry) => entry.message).join(" | ") || null,
    },
  });

  revalidatePath(`/entities/${item.entityId}/publish`);
  return log;
}
