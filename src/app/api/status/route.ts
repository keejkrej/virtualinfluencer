import { NextResponse } from "next/server";
import { configuredModels } from "@/lib/ai/provider";
import { listAdapters } from "@/lib/social";

export async function GET() {
  return NextResponse.json({
    models: configuredModels(),
    adapters: listAdapters().map((adapter) => ({
      platform: adapter.platform,
      label: adapter.label,
      live: adapter.live,
      configured: adapter.isConfigured(),
      docs: adapter.docs,
    })),
  });
}
