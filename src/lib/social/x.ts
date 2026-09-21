import { TwitterApi } from "twitter-api-v2";
import type { SocialAdapter } from "@/lib/social/types";

function oauth1Ready() {
  return Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET,
  );
}

function oauth2Ready() {
  return Boolean(process.env.X_OAUTH2_ACCESS_TOKEN);
}

export const xAdapter: SocialAdapter = {
  platform: "X",
  label: "X (Twitter)",
  get live() {
    return oauth1Ready() || oauth2Ready();
  },
  docs: "Create an X developer app, then set OAuth 1.0a user tokens (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET) to post text and media. A user OAuth 2.0 token (X_OAUTH2_ACCESS_TOKEN) can post text only. App-only bearer tokens cannot tweet.",
  isConfigured() {
    return oauth1Ready() || oauth2Ready();
  },
  async publish(payload) {
    if (!this.isConfigured()) {
      return {
        platform: "X",
        ok: false,
        live: false,
        message:
          "X credentials missing. Set OAuth 1.0a user tokens (or X_OAUTH2_ACCESS_TOKEN) in env.",
      };
    }

    try {
      if (oauth1Ready()) {
        const client = new TwitterApi({
          appKey: process.env.X_API_KEY!,
          appSecret: process.env.X_API_SECRET!,
          accessToken: process.env.X_ACCESS_TOKEN!,
          accessSecret: process.env.X_ACCESS_SECRET!,
        });
        if (payload.media) {
          const mediaId = await client.v1.uploadMedia(payload.media.bytes, {
            mimeType: payload.media.mimeType,
          });
          const tweet = await client.v2.tweet({
            text: payload.caption.slice(0, 280),
            media: { media_ids: [mediaId] },
          });
          return {
            platform: "X",
            ok: true,
            live: true,
            externalId: tweet.data.id,
            message: "Posted to X with media.",
          };
        }
        const tweet = await client.v2.tweet(payload.caption.slice(0, 280));
        return {
          platform: "X",
          ok: true,
          live: true,
          externalId: tweet.data.id,
          message: "Posted to X.",
        };
      }

      const client = new TwitterApi(process.env.X_OAUTH2_ACCESS_TOKEN!);
      const tweet = await client.v2.tweet(payload.caption.slice(0, 280));
      return {
        platform: "X",
        ok: true,
        live: true,
        externalId: tweet.data.id,
        message: payload.media
          ? "Posted text to X. Media skipped (OAuth 1.0a required for media upload)."
          : "Posted to X.",
      };
    } catch (error) {
      return {
        platform: "X",
        ok: false,
        live: true,
        message: error instanceof Error ? error.message : "X publish failed.",
      };
    }
  },
};
