import type { SocialAdapter, SocialPlatformId } from "@/lib/social/types";
import { xAdapter } from "@/lib/social/x";
import { xiaohongshuAdapter } from "@/lib/social/xiaohongshu";
import { tiktokAdapter } from "@/lib/social/tiktok";
import { bilibiliAdapter } from "@/lib/social/bilibili";

const adapters: Record<string, SocialAdapter> = {
  X: xAdapter,
  XIAOHONGSHU: xiaohongshuAdapter,
  TIKTOK: tiktokAdapter,
  BILIBILI: bilibiliAdapter,
};

export function getAdapter(platform: SocialPlatformId | string) {
  return adapters[platform];
}

export function listAdapters() {
  return Object.values(adapters);
}
