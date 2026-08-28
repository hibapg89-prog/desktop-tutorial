@AGENTS.md

# LuxeBeauty — Claude Code Session Guide

## Environment

```bash
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000
```

Add to `~/.zshrc` or `~/.bashrc` so it persists. This prevents output-token overflow when pushing large JSX/TS files (ScanHub.jsx, Vanity.jsx, etc.) in a single turn.

## Base44 → Git Sync Workflow

App ID: `6a57507f2558691b9c2c4bcf` (LuxeBeauty)  
Branch: `claude/code-quality-plugins-0XxWv`  
Repo: `hibapg89-prog/desktop-tutorial`

### Breaking large syncs into smaller batches

When syncing many files from Base44, split by group to avoid context overload:

1. **Pages** — `src/pages/*.jsx`
2. **Components** — `src/components/*.jsx`
3. **Backend functions** — `base44/functions/**`

Request each group as a separate session/message so the context window stays manageable.

### Extracting large files from Base44

If a `read_file` result is too large (>50k chars), extract with jq:

```bash
# Save to /tmp then read with the Read tool
echo '<base44-result>' | jq -r '.content' > /tmp/MyFile.jsx
```

## Security Constraints (non-negotiable)

- NEVER push to `main`/`master` without explicit "Yes push to main please" from the user
- `APIFY_TOKEN`, `GEMINI_API_KEY`, `GROQ_API_KEY` — via `secrets.get()` only, never hardcoded
- No images replaced or regenerated
- `<SwanLogo>` PNG is locked — never regenerate
- `MuseNavBar.jsx:15` label `"La Muse"` must NOT be changed

## Brand Palette

- Background: `#FFF9E8` / `#EFE9DC`
- Text: `#0B3C26`
- Accent: `#C8B06A`
- Headings: Cormorant Garamond
- Body: Inter / DM Sans
- Scan CTA / Sort tab / Save / Compare: `bg-[#043927]`
- Shop Now: `bg-[#003629]`
- No purple, no emojis in UI, real photos only, English-only copy

## Key Files

| File | Purpose |
|------|----------|
| `src/components/ScanHub.jsx` | Radial scan menu, 3-tier TikTok pipeline, moon-phase loader |
| `src/pages/Vanity.jsx` | Vanity page — grid/canvas/list/split views, bulk mode, real-time subscription |
| `src/pages/ScanResults.jsx` | Scan results display |
| `src/pages/Home.jsx` | Home page |
| `base44/functions/extractSocialContent/entry.ts` | Apify-backed social scraper (last-resort tier) |

## Vercel CI

Vercel deployments fail on this repo because there is no `package.json` or `vercel.json` at the root. This is **pre-existing** and unrelated to LuxeBeauty source changes. Fix requires adding a proper build config — tracked separately.
