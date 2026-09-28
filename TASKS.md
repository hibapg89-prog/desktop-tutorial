# Tasks

## Status Key
- `[x]` Done — coded, deployed, tested, live
- `[~]` Coded but not deployed/verified — exists in git, not yet live on Base44
- `[ ]` Not started

---

## Phase 1: Core Infrastructure
- `[x]` Project setup (Base44, Vite, React, Tailwind)
- `[x]` Brand palette and typography (Cormorant Garamond, Inter/DM Sans)
- `[x]` SwanLogo component (locked PNG)
- `[x]` Base44 client setup (`src/api/base44Client.js`)
- `[x]` App routing
- `[x]` `MEMORY.md`, `TASKS.md`, `DECISIONS.md`

## Phase 2: Scan Pipeline
- `[x]` Image scan (camera / gallery upload)
- `[x]` Voice scan
- `[x]` URL / social link scan
- `[x]` TikTok scan pipeline (Apify integration)
- `[x]` ManualProductEntry component
- `[x]` ScanLog entity — records every scan attempt
- `[x]` Brand normalizer utility (`src/utils/brandNormalizer.js`)
- `[x]` Subcategory keyword map (LLM output → grid subcategory)
- `[x]` Duplicate product detection
- `[x]` Product image enrichment (fire-and-forget after save)

## Phase 3: Credit Protection
- `[~]` **Scan rate limit** — 10 scans / 24h rolling window per user, fail-open
  - Commit: `13e9e43` on branch `claude/code-quality-plugins-0XxWv`
  - Gate: `checkScanRateLimit()` at top of `analyzeSocialLink` + `analyzeProduct`
  - ManualProductEntry naturally exempt (never calls gated functions)
  - **Blocked:** needs Base44 payment fix + sync to Base44 builder
- `[ ]` **MuseAssistant message cap** — per-session message limit (highest credit risk)
  - `MuseAssistant.jsx:118` — 1 credit per message, no limit currently
  - Dedicated session when ready

## Phase 4: UI / UX
- `[x]` TranslateToggle component (on-demand translation, non-English users only, cached)
- `[x]` ScanHub fan arc tile layout
- `[x]` Loading / error / empty states in ScanHub
- `[ ]` Mobile navbar improvement (known issue)

## Phase 5: Secrets & Config
- `[ ]` GIPHY API key — get from https://developers.giphy.com/dashboard/ → add as `GIPHY_API_KEY` in Base44 Secrets
- `[ ]` Base44 payment fix (overdue — blocks InvokeLLM)
- `[ ]` Delete two incorrect workspace PATs in Base44 workspace settings

---

## Backlog (no timeline)
- `[ ]` Notes loading state incomplete
- `[ ]` `.env.example` file with all secret key names (no values)
- `[ ]` TEST_PLAN.md once test suite exists
