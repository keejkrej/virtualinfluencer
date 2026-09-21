import { generateImage } from "ai";
import { getImageModel } from "@/lib/ai/provider";
import { DEFAULT_IMAGE_MODEL } from "@/lib/constants";

export type GeneratedStill = {
  bytes: Buffer;
  mediaType: string;
  base64: string;
  model: string;
};

async function generateViaImageApi(input: {
  prompt: string;
  model: string;
  aspectRatio?: string;
  references?: { dataUrl: string }[];
}): Promise<GeneratedStill> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  const body: Record<string, unknown> = {
    model: input.model,
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio ?? "1:1",
    output_format: "png",
  };

  if (input.references?.length) {
    body.input_references = input.references.map((ref) => ({
      type: "image_url",
      image_url: { url: ref.dataUrl },
    }));
  }

  const response = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-OpenRouter-Title": "VirtualInfluencer",
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter image API failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const json = (await response.json()) as {
    data?: { b64_json?: string; media_type?: string }[];
  };
  const image = json.data?.[0];
  if (!image?.b64_json) {
    throw new Error("OpenRouter image API returned no image data.");
  }

  const mediaType = image.media_type ?? "image/png";
  return {
    bytes: Buffer.from(image.b64_json, "base64"),
    mediaType,
    base64: image.b64_json,
    model: input.model,
  };
}

export async function generateStill(input: {
  prompt: string;
  model?: string;
  aspectRatio?: `${number}:${number}`;
  references?: { bytes: Buffer; mediaType: string }[];
}): Promise<GeneratedStill> {
  const model = input.model || DEFAULT_IMAGE_MODEL;
  const dataUrls = (input.references ?? []).map((ref) => ({
    dataUrl: `data:${ref.mediaType};base64,${ref.bytes.toString("base64")}`,
  }));

  try {
    const result = await generateImage({
      model: getImageModel(model),
      prompt: input.references?.length
        ? {
            text: input.prompt,
            images: input.references.map((ref) => ref.bytes),
          }
        : input.prompt,
      aspectRatio: input.aspectRatio ?? "1:1",
    });
    const image = result.images[0];
    if (!image) throw new Error("No image returned");
    const bytes = Buffer.from(image.uint8Array);
    return {
      bytes,
      mediaType: image.mediaType || "image/png",
      base64: image.base64,
      model,
    };
  } catch {
    return generateViaImageApi({
      prompt: input.prompt,
      model,
      aspectRatio: input.aspectRatio,
      references: dataUrls,
    });
  }
}
