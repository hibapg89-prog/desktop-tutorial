# Architecture & Design Decisions

These are permanent decisions. Do NOT reverse them without explicit user confirmation.

---

## ADR-001: Platform
**Decision:** Build on Base44 (app.base44.com).
**Reason:** Provides entities, auth, integrations (InvokeLLM, Apify), and hosting without managing infrastructure. Git repo (hibapg89-prog/desktop-tutorial) is the source of truth — all Base44 builder changes must be mirrored to git.

## ADR-002: Git is Source of Truth
**Decision:** All code changes go to git first, then synced to Base44 builder.
**Reason:** Base44 builder and git can diverge. Git is the canonical version. Never treat the Base44 live app as the source of truth for code.
**Consequence:** New Claude sessions must check git, not assume app.base44.com reflects current code.

## ADR-003: Branch Strategy
**Decision:** Never push to `main` / `master` without explicit user permission ("Yes push to main please").
**Reason:** Main is production. Only the user decides when something is ready.
**Active dev branch:** `claude/code-quality-plugins-0XxWv`

## ADR-004: Credit Protection
**Decision:** Rate-limit all LLM integration calls (InvokeLLM) that scale with user actions.
**Reason:** Base44 Builder plan has 10,000 integration credits/month (~333/day). Unthrottled usage drains the pool for all users and features.
**Implemented:** Scan rate limit — 10 scans / 24h per user (fail-open). MuseAssistant cap pending.

## ADR-005: Fail-Open Rate Limiting
**Decision:** Any error in the rate limit check (`checkScanRateLimit`) returns `{ blocked: false }`.
**Reason:** A network hiccup or query error should never lock a user out of scanning. Block only on confirmed limit breach.

## ADR-006: API Keys — Never Hardcode
**Decision:** All API keys via `secrets.get()` only. Never `process.env`, never hardcoded.
**Applies to:** `GEMINI_API_KEY`, `GROQ_API_KEY`, `YOUTUBE_API_KEY`, `APIFY_TOKEN`, `GIPHY_API_KEY`.
**Apify key** (`apify_api_AAIYT7XL9oqsXb6RevcmxmzVfcFZUu4gSyjk`) must NEVER be committed.

## ADR-007: TikTok Scan Pipeline
**Decision:** Never modify the working TikTok scan pipeline.
**Reason:** It is fragile and took significant effort to get right. Any breakage directly impacts core product value.

## ADR-008: Brand Palette — Non-Negotiable
**Decision:** The following colors are fixed and must not be changed.
| Token | Value | Usage |
|---|---|---|
| Background | `#FFF9E8` / `#EFE9DC` | Page backgrounds |
| Text | `#0B3C26` | Body copy |
| Accent | `#C8B06A` | Gold accent |
| Primary CTA | `bg-[#043927]` | Scan CTA, Sort tab, Save, Compare & Decide |
| Shop Now | `bg-[#003629]` | Shop Now button only |

**Typography:** Headings — Cormorant Garamond. Body — Inter / DM Sans.
**No purple. No emojis in rendered UI. No illustrations — real photos only. English-only UI copy.**

## ADR-009: SwanLogo
**Decision:** `<SwanLogo>` is a locked PNG asset. Never regenerate, replace, or modify it.

## ADR-010: MuseNavBar Label
**Decision:** `MuseNavBar.jsx:15` — the label `"La Muse"` must NOT be changed.

## ADR-011: Images
**Decision:** Never change, replace, or touch any app images.

## ADR-012: ManualProductEntry Exempt from Rate Limiting
**Decision:** `ManualProductEntry` component is intentionally exempt from scan rate limits.
**Reason:** Manual entry doesn't consume InvokeLLM credits — it's pure user input. Rate limit applies only to AI-powered scan functions.

## ADR-013: Vercel Preview ≠ Base44 Live
**Decision:** The Vercel preview URL cannot be used to test Base44 features (entities, InvokeLLM).
**Reason:** `base44.entities.*` and `base44.integrations.*` require a session token from Base44's OAuth flow, which only runs on app.base44.com. On Vercel preview, all base44 calls fail silently.
**Consequence:** Always test Base44 features on app.base44.com after syncing changes from git.
