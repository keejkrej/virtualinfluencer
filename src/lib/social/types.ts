export type SocialPlatformId =
  | "X"
  | "XIAOHONGSHU"
  | "TIKTOK"
  | "BILIBILI"
  | "YOUTUBE"
  | "TWITCH";

export type PublishPayload = {
  caption: string;
  media?: { bytes: Buffer; mimeType: string; filename: string } | null;
};

export type PublishResult = {
  platform: SocialPlatformId;
  ok: boolean;
  live: boolean;
  externalId?: string;
  message: string;
};

export type SocialAdapter = {
  platform: SocialPlatformId;
  label: string;
  live: boolean;
  docs: string;
  isConfigured(): boolean;
  publish(payload: PublishPayload): Promise<PublishResult>;
};
