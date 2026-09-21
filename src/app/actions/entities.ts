"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type EntityInput = {
  name: string;
  bio: string;
  personality: string;
  canonicalDescription: string;
  faceNotes: string;
  bodyNotes: string;
  wardrobePalette: string;
  styleDo: string;
  styleDont: string;
  locale: string;
  timezone: string;
  languages: string;
};

function formFrom(data: FormData): EntityInput {
  const str = (key: string) => String(data.get(key) ?? "").trim();
  return {
    name: str("name"),
    bio: str("bio"),
    personality: str("personality"),
    canonicalDescription: str("canonicalDescription"),
    faceNotes: str("faceNotes"),
    bodyNotes: str("bodyNotes"),
    wardrobePalette: str("wardrobePalette"),
    styleDo: str("styleDo"),
    styleDont: str("styleDont"),
    locale: str("locale") || "en-US",
    timezone: str("timezone") || "UTC",
    languages: str("languages") || "en",
  };
}

export async function createEntity(formData: FormData) {
  const input = formFrom(formData);
  if (!input.name) throw new Error("Name is required.");

  let slug = slugify(input.name);
  const clash = await prisma.entity.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;

  const entity = await prisma.entity.create({
    data: {
      ...input,
      slug,
      accounts: {
        create: [
          { platform: "X", status: "LIVE" },
          { platform: "XIAOHONGSHU", status: "STUB" },
          { platform: "TIKTOK", status: "STUB" },
          { platform: "BILIBILI", status: "STUB" },
        ],
      },
    },
  });

  revalidatePath("/");
  return entity.id;
}

export async function updateEntity(entityId: string, formData: FormData) {
  const input = formFrom(formData);
  if (!input.name) throw new Error("Name is required.");
  await prisma.entity.update({ where: { id: entityId }, data: input });
  revalidatePath("/");
  revalidatePath(`/entities/${entityId}`);
  revalidatePath(`/entities/${entityId}/settings`);
}

export async function deleteEntity(entityId: string) {
  await prisma.entity.delete({ where: { id: entityId } });
  revalidatePath("/");
}

export async function updateSocialHandle(
  entityId: string,
  platform: "X" | "XIAOHONGSHU" | "TIKTOK" | "BILIBILI",
  formData: FormData,
) {
  const handle = String(formData.get("handle") ?? "");
  await prisma.socialAccount.upsert({
    where: { entityId_platform: { entityId, platform } },
    update: { handle },
    create: { entityId, platform, handle, status: platform === "X" ? "LIVE" : "STUB" },
  });
  revalidatePath(`/entities/${entityId}/publish`);
  revalidatePath(`/entities/${entityId}/settings`);
}
