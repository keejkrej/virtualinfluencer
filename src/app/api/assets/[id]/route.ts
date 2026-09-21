import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readLocalAsset } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (asset.publicUrl) {
    return NextResponse.redirect(asset.publicUrl);
  }
  try {
        const body = await readLocalAsset(asset.storageKey);
        return new NextResponse(Uint8Array.from(body), {
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
