
## Growzzy OS — Build Plan

A complete, production-quality UI-only build. All data flows through one typed API client (`src/lib/api.ts`) reading `VITE_API_BASE_URL`; when the backend is unreachable every screen renders a designed empty state — never mock data.

Note on routing: project template is TanStack Router (file-based in `src/routes/`), not React Router DOM. I will use TanStack Router equivalents (`<Link>`, `useNavigate`) — same behavior, correct primitives for this stack.

---

### 1. Foundation

- **Design tokens** in `src/styles.css` (light-only): canvas `#F6F7F9`, card white, border `#E9EBEF`, primary `#1F57F5`, primary-tint `#EAF0FE`, semantic pills (green/amber/red/blue-grey/grey), Inter font, radii 14/10/999, row 52, sidebar 240.
- **Typography scale** utilities: KPI 30/700, page 20/600, card 16/600, body 14, label 13, caption 12, group 11 uppercase tracked. `tabular-nums` global on numbers.
- **Primitives**: shadcn Button/Input/Select/Textarea/Dialog/Popover/Tabs/Accordion/Table/Toast/Command retuned to tokens. `<StatusPill variant="live|paused|learning|rejected|draft|warn|info">`, `<KpiCard>`, `<SectionCard>`, `<EmptyState>`, `<SkeletonPanel>`, `<TrendPill direction-aware>`.
- **API client** `src/lib/api.ts`: typed `api.get/post/patch/delete<T>()` using `VITE_API_BASE_URL`, error normalization to human strings, `useApi` hook with skeleton→empty→error states. All endpoints defined as typed functions matching the spec.

### 2. App shell

- `src/routes/__root.tsx`: real title/meta, Inter font link, Toaster, CommandPalette (Ctrl+K).
- `_app` layout route with **Sidebar** (240px, groups CREATE / MANAGE, Getting Started progress, Quick Find, user card w/ menu) + **Topbar** (Quick Find, Help, Bell, primary "+ New campaign"). Collapses to icons under 1100px.

### 3. Routes (TanStack file-based)

```
/onboarding                     → 3-step vertical pill checklist
/                               → New Campaign (prompt home, default)
/projects, /projects/$id        → folder grid → filtered manager
/brand                          → My Brand kit
/prompts                        → Recent Prompts list
/builder/$planId                → 3-column Campaign Builder
/dashboard                      → KPIs + chart + Needs Attention
/ads                            → Ads Manager table
/analytics                      → Advanced analytics + AI insights panel
/optimization                   → Recommendations / Action Log / Autopilot tabs
/studio                         → Generate / Library tabs
/settings/{general,integrations,notifications,danger}
/auth/{login,signup,forgot}     → centered card, blue accent
```

### 4. Section highlights

- **Onboarding**: whole roadmap always visible; step 1 collapsed-checked, step 2 workspace form → `PATCH /api/onboarding`, step 3 Google connect (`GET /api/integrations/google/connect` → account picker → syncing sub-state), Meta disabled with honest copy.
- **New Campaign**: hero, 5-row prompt, debounced parser flips 5 chips (Ad objective/Audience/Location/Budget/Landing page), compact inputs, "✨ AI enhance & build plan" → `POST /api/ai/campaign-builder` → `/builder/:id`. Prompt saved to Recent Prompts.
- **Campaign Builder**: left step rail (filled/ring/grey states, click to jump), middle accordion (name+score pill, Goal & bidding + "Why this bidding" tinted card, keywords chips w/ match toggle + negatives, ads w/ live char counters 30/90, budget + estimate, Policy check pass/warn/fail w/ one-click apply), pinned Publish → `POST /api/ai/campaign-plan/:id/launch` success screen. Right: live Google SERP preview + summary card. Debounced `PATCH` on every edit.
- **Dashboard**: 4 KPI cards (direction-aware trend), 2/3 spend+results chart w/ Daily/Weekly/Monthly, 1/3 Needs Attention AI cards, top campaigns table, platform cards (Google connected / Meta coming soon). Disconnected state = single centered connect card.
- **Ads Manager**: search + 2 filters only, columns per spec, row hover quick-view popover, bulk action bar on selection, ⋯ menu, `GET /api/campaigns`.
- **Analytics**: filter bar, KPI row, time-series w/ metric picker + compare overlay, tabs (Campaign / Keyword / Device+Geo), Insights side panel `POST /api/ai/insights`.
- **AI Optimization**: 3 tabs (Recommendations w/ Apply→`POST /api/optimization-actions/:id/approve` optimistic + Undo toast; Action Log timeline w/ 30d undo; Autopilot 3 modes + guardrails + Stop Loss friction dialog).
- **Ad Studio**: Generate split w/ "Using My Brand ✓" chip + variant cards; Library grid, perf only after real campaign use.
- **My Brand** → `PATCH /api/workspace/brand`. **Settings** sub-nav with danger zone confirm dialog.
- **Auth**: centered white card, blue accent, matching type scale.

### 5. Global behaviors

- Skeleton loaders on every data panel (no bare spinners).
- Human toast copy on all mutations; error strings translated ("Couldn't reach Google Ads — try again").
- Ctrl+K palette: navigate + search campaigns.
- Jargon filter: pill text and empty-state copy audited — no "verified/stale/sync state/workspace scoped".
- Every list/table/chart ships a designed empty state component; no fake data anywhere.

### Technical notes

- Charts: `recharts` (already common in template) themed to blue primary + light-blue secondary.
- State: TanStack Query for all API calls (already wired in template) with `ensureQueryData` in loaders where beneficial; optimistic updates on Apply/Pause/Enable.
- Icons: `lucide-react`.
- No backend work; all endpoints are typed stubs in `api.ts` ready to hit real URLs via `VITE_API_BASE_URL`.
- Head metadata set per route; og:image only where a meaningful cover exists (skipped elsewhere).

### Out of scope

- Real OAuth, real ad delivery, real AI generation — the UI wires the endpoints and shows honest empty/error states until a backend responds.
- Meta integration UI beyond the "Coming soon" disabled card.
