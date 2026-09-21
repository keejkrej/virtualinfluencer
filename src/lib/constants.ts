export const DEFAULT_TEXT_MODEL =
  process.env.OPENROUTER_TEXT_MODEL ?? "openai/gpt-4.1-mini";

export const DEFAULT_IMAGE_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL ??
  "google/gemini-3.1-flash-image-preview";

export const SOCIAL_PLATFORMS = [
  "X",
  "XIAOHONGSHU",
  "TIKTOK",
  "BILIBILI",
] as const;

export const FUTURE_STREAM_TARGETS = ["BILIBILI", "YOUTUBE", "TWITCH"] as const;

export const LIFE_EVENT_TYPES = [
  "SHOPPING",
  "DINING",
  "EVENT",
  "TRAVEL",
  "WORK",
  "HOBBY",
  "RELATIONSHIP",
  "OTHER",
] as const;

export const LIFE_EVENT_STATUSES = ["PLANNED", "HAPPENING", "DONE"] as const;

export const CONTENT_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHING",
  "PUBLISHED",
  "FAILED",
] as const;

export function splitCsv(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinCsv(values: string[]): string {
  return values.map((value) => value.trim()).filter(Boolean).join(", ");
}
