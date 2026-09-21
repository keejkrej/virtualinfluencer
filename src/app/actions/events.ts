"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { LifeEventStatus, LifeEventType } from "@/generated/prisma/client";

export async function createLifeEvent(entityId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required.");
  const startsAt = String(formData.get("startsAt") ?? "");
  await prisma.lifeEvent.create({
    data: {
      entityId,
      type: (String(formData.get("type") ?? "OTHER") as LifeEventType) || "OTHER",
      title,
      description: String(formData.get("description") ?? ""),
      location: String(formData.get("location") ?? ""),
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      mood: String(formData.get("mood") ?? ""),
      companions: String(formData.get("companions") ?? ""),
      status: (String(formData.get("status") ?? "PLANNED") as LifeEventStatus) || "PLANNED",
    },
  });
  revalidatePath(`/entities/${entityId}/life`);
  revalidatePath("/calendar");
}

export async function updateLifeEventStatus(
  eventId: string,
  status: LifeEventStatus,
) {
  const event = await prisma.lifeEvent.update({
    where: { id: eventId },
    data: { status },
  });
  revalidatePath(`/entities/${event.entityId}/life`);
  revalidatePath("/calendar");
}

export async function deleteLifeEvent(eventId: string) {
  const event = await prisma.lifeEvent.delete({ where: { id: eventId } });
  revalidatePath(`/entities/${event.entityId}/life`);
  revalidatePath("/calendar");
}
