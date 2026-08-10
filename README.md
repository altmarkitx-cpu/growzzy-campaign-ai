# Growzzy Campaign AI

Build: Growzzy OS — AI Ad Management Platform (Complete App UI)

Build a complete, production-quality SaaS web app UI for Growzzy OS — an AI marketing platform where solo founders and small teams (zero marketing knowledge) create, launch, and optimize Google & Meta ad campaigns. It combines two products in one: a Blynk-style AI campaign creator (prompt → campaign) and a Madgicx-style manager (dashboard, advanced analytics, AI optimization).

Stack: React + Vite + TypeScript + Tailwind + shadcn/ui. React Router. All data via a single API client (src/lib/api.ts) with VITE_API_BASE_URL env var — every fetch goes through it so the app can connect to the real backend later. Where endpoints are noted below, wire them; return typed empty states when the API is unreachable. Never render fake/demo data — every screen must have an honest, designed empty state.

Design System (strict)

Theme: light only. Canvas #F6F7F9, cards white, hairline borders #E9EBEF, soft shadows.

Accent: Growzzy blue #1F57F5 — primary buttons, active nav, links, chart primary series, focus rings. Blue tint #EAF0FE for active-nav background and highlight wells. No green, no black buttons.

Semantic colors (pills only): green #2E9E5B/bg #E6F4EC (live/positive), amber #B8892B/bg #FBF0DA (paused/warning), red #D3564C/bg #FBE7E5 (rejected/negative), blue-grey for learning, grey for draft.

Type: Inter. Scale: 30px/700 KPI numbers · 20px/600 page titles · 16px/600 card titles · 14px body · 13px labels · 12px captions/table headers · 11px uppercase tracked group labels. tabular-nums on all numbers.

Radii: 14px cards, 10px inputs/buttons, 999px pills. Row height 52px. Card gap 16px. Sidebar 240px.

Status = pill with word + color, never a bare dot. All jargon banned: never show "verified", "trust filter", "stale", "sync state", "workspace scoped" — plain human language only.

Sidebar (persistent, white)

Top: Growzzy logo tile + "Growzzy" + BETA chip.

CREATE (group label)

✦ New Campaign (the prompt home — default route after onboarding)

📁 Projects (campaign folders)

🖥️ My Brand (brand kit)

💡 Recent Prompts (saved briefs list, + to add; empty state: "Your saved campaign prompts appear here")

MANAGE (group label)

📊 Dashboard

📣 Ads Manager

📈 Analytics

⚡ AI Optimization

🎨 Ad Studio

Bottom: Getting Started progress bar (% from onboarding+first actions) · Quick Find (Ctrl+K command palette) · user card (avatar, name, workspace, chevron → menu with Settings/Sign out).

Top bar: Quick find field · Help · notifications bell · + New campaign (blue, primary).

1. Onboarding (first-run, full-screen, 3 steps shown as a vertical pill checklist — whole roadmap always visible, active step expanded)

Step 1 — Create your identity — already completed at signup; render as a collapsed, checked pill showing name, email, "Authenticated ✓".

Step 2 — Configure your workspace (form):

Business name, Website URL

Primary goal (radio: Sales / Leads / App installs / Website traffic)

Currency + timezone selects

Daily budget ceiling ($ input, helper: "Growzzy can never spend more than this per day — enforced automatically")

Short product description textarea ("Used by the AI to write your campaigns")

PATCH /api/onboarding

Step 3 — Connect your advertising:

Google Ads card: Connect button → GET /api/integrations/google/connect (OAuth redirect) → returns to account picker (select Google Ads account) → "Connected ✓, syncing your account…" sub-state with spinner → check.

Meta card visible but disabled: "Coming soon — Google is fully supported today." Never a fake connect.

Finish button: "Create your first campaign" → routes to New Campaign. Skippable ("I'll connect later").

2. New Campaign — prompt home (Blynk section)

Centered hero: "Run ad campaigns in minutes." + sub: "Tell Growzzy what you want to promote. AI builds the strategy, targeting and ads for you."

One large prompt textarea (5 rows), example placeholder.

Beneath it, a live checklist row that parses the typed text (debounced) and flips chips from grey outline to blue check as each becomes inferable: Ad objective Target audience Location Budget Landing page.

Row of compact inputs under the box: target audience, location, daily budget $, goal select, landing page URL (optional).

"✨ AI enhance & build plan" primary button → POST /api/ai/campaign-builder → navigate to Campaign Builder with returned campaignPlanId.

Each generated plan also saves the prompt into Recent Prompts.

3. Campaign Builder (3-column, one screen, no wizard)

Left (240px) — "Campaign Flow / Complete all steps before publish": vertical steps — Brief · Goal & bidding · Targeting · Keywords · Ads · Budget · Policy check · Publish. Completed = filled blue circle with white check, connected by a thin vertical line; current = blue ring; future = grey. Click to jump.

Middle — accordion editor (one section open), loading plan via GET /api/ai/campaign-plan/:id, every edit debounced PATCH /api/ai/campaign-plan/:id:

Campaign name (inline editable) + launch readiness score pill ("Score 78/100", blue tint).

Goal & bidding: objective select, bidding select, and an "✨ Why this bidding" tinted card with the AI's plain-English rationale (from plan.rationale).

Keywords per ad group: chips (click ✕ to remove, type+enter to add, Broad/Phrase/Exact toggle per chip); negative keywords as red-tinted chips.

Ads per ad group: headline inputs with live character counters (30 max, red at limit), descriptions (90 max). Per-group "Regenerate copy" button.

Budget: $/day input + expected results estimate line.

Policy check: POST /api/ai/policy-check → PASS (green pill) / WARN (amber, expandable flag list: exact phrase, reason, one-click "Apply suggestion") / FAIL (red, blocks).

Publish (pinned bottom): "Launch (starts paused)" blue button → POST /api/ai/campaign-plan/:id/launch → success screen with Google campaign ID → "Enable when ready" explanation → link to Ads Manager.

Right (360px) — Live Google ad preview, always rendering current state: realistic SERP mockup — "Sponsored", display URL, blue headline combination (rotate combinations), description — plus a summary card: Budget $/day, Publish state pill, Policy pill. "Preview combinations" expander.

4. Projects

Folder grid: name, campaign count, aggregate spend. Create/rename/delete. Opening a project = filtered Ads Manager. Campaigns can be assigned to a project from their ⋯ menu.

5. My Brand

Brand kit form the AI reads from: business name, website, logo upload, industry, tone select, product description, default landing page. Save → PATCH /api/workspace/brand. Helper: "Every campaign Growzzy writes uses this."

6. Recent Prompts

List of saved briefs (full text, date, goal chip). Actions: Re-run (prefills prompt home), Edit, Delete.

7. Dashboard (Madgicx section)

Row 1 — 4 KPI cards: Spend (7d) · Conversions · Cost/result · ROAS. Icon+label top, 30px number, trend pill vs prior period (green up/red down; direction-aware — lower CPA is green), caption below. Date-range pill top-left of page ("Last 30 days"), Export button.

Row 2 — Spend & results chart (2/3): two-series bar/line, blue primary + light-blue secondary, Daily/Weekly/Monthly toggle. Needs Attention feed (1/3): AI recommendation cards — severity dot, finding with real numbers, [Apply] [Dismiss] buttons.

Row 3 — Top campaigns table (top 5 by spend) + platform breakdown cards (Google connected; Meta "Connect — coming soon").

Disconnected state: ONE centered connect card, not repeated blocks.

8. Ads Manager

Clean table (NOT a filter wall): search + 2 filters only (Platform, Status). Columns: checkbox · Name (platform favicon + name) · Status pill (Live/Paused/Learning/Rejected/Draft) · Spend · Clicks · Conversions · CPA · ROAS · ⋯ (Pause/Enable/Duplicate/View). Bulk bar appears on selection. Row hover → quick-view popover: mini metrics, status, budget, and inline actions. Header: Sync (icon button) + New Campaign (blue). GET /api/campaigns.

9. Analytics (advanced)

Filter bar: date range, campaign multi-select, platform.

KPI row (same card component).

Large time-series chart with metric picker (Spend/Clicks/CTR/Conversions/CPA/ROAS), compare-two-metrics overlay.

Breakdown tabs: By campaign (sortable table) · By keyword (best/worst spend-vs-conversion) · By device/geo (bar charts).

"Insights" side panel: AI-written observations grounded in the visible data (POST /api/ai/insights), each with a "why" line.

10. AI Optimization

Three tabs:

Recommendations: prioritized cards — severity pill (Critical/Medium/Low), finding with numbers ("Ad group X spent $47, 0 conversions"), plain-English explanation, [Apply] [Dismiss] [Snooze 7d]. Apply = POST /api/optimization-actions/:id/approve, optimistic UI + toast with Undo.

Action Log: timeline table — date, action, target, prior→new state, outcome line ("saved ~$34, no conversion loss"), Undo button (30d).

Autopilot: three mode cards — Alert only (default) / Approval required / Full autopilot — each with a plain-English "what this may do" list; guardrail settings: max daily budget shift %, budget ceiling display, "Stop Loss" toggle (default ON, friction dialog to disable).

11. Ad Studio (AI ad generator)

Two tabs:

Generate: split screen. Left: prompt textarea ("Describe the ad you want"), format select (Search ad / Display / Social image), aspect ratio, "✨ Generate" — brand context auto-loaded from My Brand (shown as a small "Using My Brand ✓" chip, not a form). Right: live preview frame (SERP mockup for search, social card for image ads) + generated variants as cards with Regenerate / Edit / Save / Use in campaign.

Library: grid of saved creatives — thumbnail, format chip, date; performance stats appear on cards only once actually used in a live campaign.

12. Settings

Left sub-nav: General (workspace name, currency, timezone, budget ceiling, product description) · Integrations (Google card: connected account, Sync now, Switch account, Disconnect; Meta disabled card) · Notifications (email toggles: weekly digest, optimization alerts, budget alerts) · Danger zone (delete account, red, confirm dialog).

Global behaviors

Skeleton loaders on every data panel (no spinners-only).

Toasts for every action result; errors are human ("Couldn't reach Google Ads — try again" not error codes).

Ctrl+K command palette: jump to any section, search campaigns.

Responsive: sidebar collapses to icons <1100px; builder stacks preview below editor on mobile.

Auth screens (login/signup/forgot) in the same style, blue accent, centered card. see the baove references see the refence analyse the aesthetics and typography to build this

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e479caa6-67e4-4a53-8d3d-13bdae79defc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
