# Project Memory

## App Identity
- **Name:** La Muse (The Muse) — beauty product scanner & tracker
- **Platform:** Base44 (app.base44.com)
- **Base44 App ID:** `6a57507f2558691b9c2c4bcf`
- **Base44 Plan:** Builder (10,000 integration credits/month)
- **Git repo:** hibapg89-prog/desktop-tutorial
- **Dev branch:** `claude/code-quality-plugins-0XxWv`
- **PR:** #6 (open, CI green)
- **Vercel preview:** `desktop-tutorial-git-claude-code-b1e109-hibapg89-progs-projects.vercel.app`

## Current Status
Rate limit feature coded and in git/Vercel — NOT yet live on Base44.
Base44 subscription payment is overdue ("Paiement d'abonnement en retard") — scans non-functional on live app until resolved.

## Completed
- Project setup, brand palette, SwanLogo
- Full scan pipeline (image, gallery, voice, link, social/TikTok)
- ManualProductEntry component
- ScanLog entity for scan history
- Brand normalizer utility
- Subcategory keyword mapping (LLM → grid subcategory)
- Duplicate product check
- TranslateToggle component (on-demand translation for non-English users)
- Scan rate limit — `checkScanRateLimit()` gating both `analyzeSocialLink` and `analyzeProduct` (10 scans / 24h rolling window, fail-open) — **committed `13e9e43`, in git only**

## In Progress (coded, not deployed)
- `[~]` **Scan rate limit** — commit `13e9e43` on `claude/code-quality-plugins-0XxWv`. Needs to be synced to Base44 builder before it goes live on app.base44.com.

## Pending Tasks
- `[ ]` Fix Base44 overdue payment (blocking all scans)
- `[ ]` Sync rate limit code to Base44 builder
- `[ ]` Test rate limit end-to-end on app.base44.com (10 scans → message)
- `[ ]` MuseAssistant message cap (highest-risk credit consumer — dedicated session)
- `[ ]` Get GIPHY API key from https://developers.giphy.com/dashboard/ → add as `GIPHY_API_KEY` in Base44 app-level Secrets
- `[ ]` Delete two incorrect workspace PATs from Base44 workspace settings (optional cleanup)

## Known Issues
- Base44 payment overdue → InvokeLLM suspended → all scan modes return "Something went wrong"
- Vercel preview cannot be used to test Base44 features (base44 client requires session auth from app.base44.com OAuth flow)
- Git and Base44 live app are diverged — git has rate limit code, app.base44.com does not yet

## Next Step
Fix Base44 payment → sync rate limit to Base44 builder → test on app.base44.com.
