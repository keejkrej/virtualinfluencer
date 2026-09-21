# avatar

2026-09-21, golden pair via CLI (`npx shadcn@latest add avatar -y -o` after flipping `components.json` to `base-lyra`). Migrated.

## Changed

- `src/components/ui/avatar.tsx`: overwritten from the base-lyra registry. Leftover scan `radix-ui|@radix-ui` is clean on this file.

## Left alone

- `src/components/ui/command.tsx` — cmdk
- `src/components/ui/calendar.tsx` — react-day-picker
- `src/components/ui/sonner.tsx` — sonner

## Behavior changes

None patched. Wrapper matches the shadcn base-lyra registry.

## Verify by hand

Open a screen that uses `avatar` and confirm keyboard/pointer behavior still matches the previous Lyra UI.
