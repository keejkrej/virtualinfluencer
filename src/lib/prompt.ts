export type ConsistencyProfile = {
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

export function buildConsistencyProfile(entity: ConsistencyProfile): string {
  return [
    `You are helping operate a virtual influencer named ${entity.name}.`,
    "Consistency is the product. Never invent a new face, body, age, ethnicity, or wardrobe palette.",
    "",
    "Identity",
    `- Name: ${entity.name}`,
    `- Bio: ${entity.bio || "(not set)"}`,
    `- Personality / voice: ${entity.personality || "(not set)"}`,
    `- Locale: ${entity.locale} (${entity.timezone})`,
    `- Languages: ${entity.languages}`,
    "",
    "Visual style bible (canonical — always apply)",
    `- Canonical description: ${entity.canonicalDescription || "(not set)"}`,
    `- Face: ${entity.faceNotes || "(not set)"}`,
    `- Body: ${entity.bodyNotes || "(not set)"}`,
    `- Wardrobe palette: ${entity.wardrobePalette || "(not set)"}`,
    `- Do: ${entity.styleDo || "(not set)"}`,
    `- Don't: ${entity.styleDont || "(not set)"}`,
    "",
    "Rules",
    "- Keep the character PG-13.",
    "- Treat canonical reference images as identity locks when provided.",
    "- Describe clothing and setting changes, never identity changes.",
    "- Write captions in the entity's voice and languages.",
  ].join("\n");
}

export function buildImagePrompt(input: {
  entity: ConsistencyProfile;
  scene: string;
  outfit?: string;
  emotion?: string;
  extra?: string;
}): string {
  return [
    `Photorealistic editorial still of ${input.entity.name}, a consistent virtual person.`,
    input.entity.canonicalDescription,
    input.entity.faceNotes && `Face lock: ${input.entity.faceNotes}`,
    input.entity.bodyNotes && `Body lock: ${input.entity.bodyNotes}`,
    input.entity.wardrobePalette && `Palette: ${input.entity.wardrobePalette}`,
    input.outfit && `Outfit: ${input.outfit}`,
    input.emotion && `Mood / emotion: ${input.emotion}`,
    `Scene: ${input.scene}`,
    input.extra,
    input.entity.styleDo && `Must: ${input.entity.styleDo}`,
    input.entity.styleDont && `Must not: ${input.entity.styleDont}`,
    "Same person as the reference images. Natural lighting, no extra text, no watermark, no celebrity likeness.",
  ]
    .filter(Boolean)
    .join("\n");
}
