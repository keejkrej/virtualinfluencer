import { generateText, Output } from "ai";
import { z } from "zod";
import { getTextModel } from "@/lib/ai/provider";
import { buildConsistencyProfile, type ConsistencyProfile } from "@/lib/prompt";
import { DEFAULT_TEXT_MODEL } from "@/lib/constants";

const draftSchema = z.object({
  caption: z.string(),
  imagePrompt: z.string(),
  platforms: z.array(z.enum(["X", "XIAOHONGSHU", "TIKTOK", "BILIBILI"])),
  rationale: z.string(),
});

export type ContentDraft = z.infer<typeof draftSchema>;

export async function draftFromLifeEvent(input: {
  entity: ConsistencyProfile;
  event: {
    type: string;
    title: string;
    description: string;
    location: string;
    mood: string;
    companions: string;
  };
  model?: string;
}): Promise<ContentDraft> {
  const result = await generateText({
    model: getTextModel(input.model ?? DEFAULT_TEXT_MODEL),
    output: Output.object({ schema: draftSchema }),
    system: buildConsistencyProfile(input.entity),
    prompt: [
      "Create a social content draft from this PG-13 life event.",
      `Type: ${input.event.type}`,
      `Title: ${input.event.title}`,
      `Description: ${input.event.description}`,
      `Location: ${input.event.location}`,
      `Mood: ${input.event.mood}`,
      `Companions: ${input.event.companions || "solo"}`,
      "",
      "Return a caption in the entity voice, a detailed image prompt that respects the style bible, suggested platforms, and a short rationale.",
      "Keep captions native-length per platform: short for X, warmer/longer for Xiaohongshu.",
    ].join("\n"),
  });

  return result.output;
}
