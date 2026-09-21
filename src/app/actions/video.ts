"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { storeAsset } from "@/lib/storage";
import type { SocialPlatform } from "@/generated/prisma/client";

export async function createVideoProject(formData: FormData) {
  const entityId = String(formData.get("entityId") ?? "");
  if (!entityId) throw new Error("entityId is required.");
  const title = String(formData.get("title") ?? "").trim() || "Untitled sequence";
  const assetIds = String(formData.get("assetIds") ?? "");
  await prisma.videoProject.create({
    data: { entityId, title, description: String(formData.get("description") ?? ""), assetIds },
  });
  revalidatePath(`/entities/${entityId}`);
  revalidatePath("/studio");
}

export async function composeVideoStub(projectId: string) {
  const project = await prisma.videoProject.findUniqueOrThrow({
    where: { id: projectId },
    include: { entity: true },
  });
  const ids = project.assetIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const storyboard = [
    `# VirtualInfluencer storyboard — ${project.title}`,
    `Entity: ${project.entity.name}`,
    `Frames: ${ids.join(" → ") || "(none selected)"}`,
    "",
    "TODO: encode an mp4 (ffmpeg / a media pipeline) from these stills.",
    "This stub stores the ordered frame list so a later worker can pick it up.",
  ].join("\n");

  const key = `${project.entityId}/video/${project.id}.txt`;
  const stored = await storeAsset({
    key,
    body: Buffer.from(storyboard),
    contentType: "text/plain",
    filename: `${project.id}.txt`,
  });

  await prisma.videoProject.update({
    where: { id: projectId },
    data: { status: "READY", outputKey: stored.publicUrl ?? stored.key },
  });
  revalidatePath("/studio");
}

export async function createStreamSession(formData: FormData) {
  const entityId = String(formData.get("entityId") ?? "");
  if (!entityId) throw new Error("entityId is required.");
  await prisma.streamSession.create({
    data: {
      entityId,
      title: String(formData.get("title") ?? "Untitled stream"),
      platform: (String(formData.get("platform") ?? "YOUTUBE") as SocialPlatform) || "YOUTUBE",
      notes: String(formData.get("notes") ?? ""),
      startsAt: formData.get("startsAt")
        ? new Date(String(formData.get("startsAt")))
        : null,
    },
  });
  revalidatePath("/studio");
}
