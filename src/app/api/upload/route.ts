import { NextResponse } from "next/server";
import { saveAssetRecord } from "@/app/actions/assets";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const entityId = String(form.get("entityId") ?? "");
  const file = form.get("file");
  if (!entityId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "entityId and file are required." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const asset = await saveAssetRecord({
    entityId,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    body: bytes,
    tags: String(form.get("tags") ?? ""),
    scene: String(form.get("scene") ?? "") || undefined,
    outfit: String(form.get("outfit") ?? "") || undefined,
    emotion: String(form.get("emotion") ?? "") || undefined,
    canonical: form.get("canonical") === "on" || form.get("canonical") === "true",
    source: form.get("canonical") ? "REFERENCE" : "UPLOAD",
    kind: file.type.startsWith("video")
      ? "VIDEO"
      : file.type.startsWith("audio")
        ? "AUDIO"
        : "IMAGE",
  });

  return NextResponse.json({ id: asset.id });
}
