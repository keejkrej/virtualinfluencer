import { NextResponse } from "next/server";
import { generateEntityStill } from "@/app/actions/content";
import { hasOpenRouterKey } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasOpenRouterKey()) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set." },
      { status: 400 },
    );
  }

  const body = (await req.json()) as {
    entityId: string;
    scene: string;
    outfit?: string;
    emotion?: string;
    extra?: string;
    model?: string;
    aspectRatio?: `${number}:${number}`;
    referenceIds?: string[];
  };

  if (!body.entityId || !body.scene) {
    return NextResponse.json(
      { error: "entityId and scene are required." },
      { status: 400 },
    );
  }

  try {
    const still = await generateEntityStill(body);
    return NextResponse.json(still);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
