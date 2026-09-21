import type { SocialAdapter } from "@/lib/social/types";

export const xiaohongshuAdapter: SocialAdapter = {
  platform: "XIAOHONGSHU",
  label: "Xiaohongshu (小红书)",
  live: false,
  docs: "Apply at https://open.xiaohongshu.com. Create an app, complete business verification, then implement OAuth 2.0 (authorization code) for note.create. Notes typically need title + body + 1–9 images. This MVP keeps a stub until those credentials and review are in place.",
  isConfigured() {
    return Boolean(process.env.XHS_APP_KEY && process.env.XHS_APP_SECRET);
  },
  async publish() {
    return {
      platform: "XIAOHONGSHU",
      ok: false,
      live: false,
      message:
        "Xiaohongshu adapter is stubbed. Configure XHS_APP_KEY / XHS_APP_SECRET and implement the official note publish API after app review.",
    };
  },
};
