import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getTextModel, hasOpenRouterKey } from "@/lib/ai/provider";
import { buildConsistencyProfile } from "@/lib/prompt";
import { generateEntityStill, createDraftFromEvent } from "@/app/actions/content";
import { DEFAULT_TEXT_MODEL } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasOpenRouterKey()) {
    return new Response(
      "OPENROUTER_API_KEY is not set. Add it in .env.local or Vercel env.",
      { status: 400 },
    );
  }

  const body = (await req.json()) as {
    messages: UIMessage[];
    entityId?: string;
    model?: string;
  };

  const entity = body.entityId
    ? await prisma.entity.findUnique({ where: { id: body.entityId } })
    : null;

  const system = entity
    ? `${buildConsistencyProfile(entity)}

You can call tools to generate a still grounded in the style bible, or to draft a caption from a life event id.`
    : "You help operators create consistent virtual influencers. Ask them to open an entity workspace for grounded generation.";

  const result = streamText({
    model: getTextModel(body.model ?? DEFAULT_TEXT_MODEL),
    system,
    messages: await convertToModelMessages(body.messages),
    tools: entity
      ? {
          generateStill: tool({
            description:
              "Generate a consistency-locked still of this entity and save it to the asset library.",
            inputSchema: z.object({
              scene: z.string(),
              outfit: z.string().optional(),
              emotion: z.string().optional(),
            }),
            execute: async ({ scene, outfit, emotion }) => {
              const still = await generateEntityStill({
                entityId: entity.id,
                scene,
                outfit,
                emotion,
              });
              return {
                assetId: still.assetId,
                prompt: still.prompt,
                model: still.model,
              };
            },
          }),
          draftFromEvent: tool({
            description: "Turn a life event into a caption + image prompt draft.",
            inputSchema: z.object({ eventId: z.string() }),
            execute: async ({ eventId }) => createDraftFromEvent(eventId),
          }),
        }
      : undefined,
  });

  return result.toUIMessageStreamResponse();
}
