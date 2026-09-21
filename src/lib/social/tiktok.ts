import type { SocialAdapter } from "@/lib/social/types";

export const tiktokAdapter: SocialAdapter = {
  platform: "TIKTOK",
  label: "TikTok",
  live: false,
  docs: "Use TikTok for Developers Content Posting API (https://developers.tiktok.com/doc/content-posting-api-get-started). OAuth 2.0 with video.upload / video.publish. Inbox (user reviews in TikTok) vs Direct Post (requires additional audit). This adapter is a stub.",
  isConfigured() {
    return Boolean(
      process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET,
    );
  },
  async publish() {
    return {
      platform: "TIKTOK",
      ok: false,
      live: false,
      message:
        "TikTok adapter is stubbed. Add TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET and complete Content Posting API OAuth.",
    };
  },
};
