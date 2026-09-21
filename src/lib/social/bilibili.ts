import type { SocialAdapter } from "@/lib/social/types";

export const bilibiliAdapter: SocialAdapter = {
  platform: "BILIBILI",
  label: "Bilibili",
  live: false,
  docs: "Bilibili open platform (https://openhome.bilibili.com): register an app, obtain App Key / Secret, then OAuth for video upload and (separately) live streaming. Cover + title + tags + partition are required for archives. This adapter is a stub.",
  isConfigured() {
    return Boolean(
      process.env.BILIBILI_APP_KEY && process.env.BILIBILI_APP_SECRET,
    );
  },
  async publish() {
    return {
      platform: "BILIBILI",
      ok: false,
      live: false,
      message:
        "Bilibili adapter is stubbed. Add BILIBILI_APP_KEY / BILIBILI_APP_SECRET and implement archive upload / live room APIs.",
    };
  },
};
