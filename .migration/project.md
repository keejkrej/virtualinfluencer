# Whole-project Radix → Base UI (Lyra)

2026-09-21, whole-project mode. Golden pair via CLI after flipping `components.json` `radix-lyra` → `base-lyra`.

## Verdict

UI wrappers are on `@base-ui/react` with Lyra tokens. Direct `radix-ui` / `@radix-ui/*` dependencies are removed. `cmdk` still pulls `@radix-ui/react-dialog` transitively (left alone per skill). 0 wrappers in `src/components/ui` remain on Radix.

## Changed

- `components.json`: `"style": "base-lyra"` (Phosphor + `@ai-elements` registry kept).
- Regenerated radix-backed `src/components/ui/*` with `npx shadcn@latest add <name> -y -o` (not `--all`).
- Installed `@base-ui/react`; uninstalled `radix-ui` and `@radix-ui/react-use-controllable-state`.
- App call sites: `asChild` → `render` (+ `nativeButton={false}` on Button→Link).
- AI Elements: Tooltip/Dropdown/Collapsible `asChild` → `render`; HoverCard `openDelay` moved to Trigger as `delay`; Select `items` on generate-studio; local controllable-state hook in `reasoning.tsx`.
- README / CONTRIBUTING: document `base-lyra`.

## Left alone

- `command` (cmdk), `calendar` (react-day-picker), `sonner`.
- AI Elements product logic; only the primitive layer was swapped.
- Lyra tokens, JetBrains Mono, Phosphor icons.

## Behavior changes

- Tabs stay at Base UI default (manual activation). Flagged, not patched.
- Dropdown menu items: `onSelect` → `onClick`; `closeOnClick={false}` where Radix `preventDefault` kept the menu open (prompt-input attachments).
- HoverCard delays now live on the trigger (`delay` / `closeDelay`).
- Collapsible/open-state CSS hooks in AI Elements: `data-[state=open]` → `data-open`.
- Button-as-link uses Base `render` + `nativeButton={false}` (Base Button still sets `role="button"`).

## Verify by hand

Entity dashboard links, sidebar nav, generate-studio aspect select, tooltips on prompt buttons, collapsible AI tool/task panels.
