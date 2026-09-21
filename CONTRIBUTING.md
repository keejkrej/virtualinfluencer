# Contributing to VirtualInfluencer

This is a small public MVP. Useful contributions:

1. **Consistency** — anything that keeps an entity looking and sounding like itself.
2. **Adapters** — turning Xiaohongshu / TikTok / Bilibili stubs into live publishers.
3. **Video / streaming** — ffmpeg (or a hosted encoder) plus YouTube / Twitch / Bilibili live.

## Local loop

```bash
npm install
cp .env.example .env.local   # add OPENROUTER_API_KEY
npm run dev
```

`npm run dev` generates Prisma Client, pushes the SQLite schema, and seeds the demo entity **Lumen Park** (fictional; not a celebrity likeness).

## Conventions

- Next.js App Router, TypeScript, server actions for mutations.
- UI: **shadcn/ui Lyra** (`radix-lyra`) + **AI Elements**. Do not add a custom palette, gradients, or one-off component skins.
- Generation goes through the Vercel AI SDK and OpenRouter. Do not call provider SDKs directly.
- Secrets only in `.env.local` / Vercel env — never in the database or client bundle.

Open a PR against `main` with a short note on what you tested (entity create, generate, queue).
