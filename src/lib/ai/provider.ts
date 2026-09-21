import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL } from "@/lib/constants";

export function hasOpenRouterKey() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function getOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local (or Vercel env) to generate images and drafts.",
    );
  }

  return createOpenRouter({
    apiKey,
    appName: "VirtualInfluencer",
    appUrl:
      process.env.APP_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  });
}

export function getTextModel(modelId = DEFAULT_TEXT_MODEL) {
  return getOpenRouter().chat(modelId);
}

export function getImageModel(modelId = DEFAULT_IMAGE_MODEL) {
  return getOpenRouter().imageModel(modelId);
}

export function configuredModels() {
  return {
    text: process.env.OPENROUTER_TEXT_MODEL ?? DEFAULT_TEXT_MODEL,
    image: process.env.OPENROUTER_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL,
    openRouter: hasOpenRouterKey(),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    database:
      process.env.DATABASE_URL?.startsWith("postgres") ? "postgres" : "sqlite",
  };
}
