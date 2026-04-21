

## Interactive In-App Presentation — Tech Partner Pitch

A new `/presentation` route with a fullscreen-capable, keyboard-navigable slide deck (~20 slides) tailored for a technical/integration partner. Built into the app so you can demo it live alongside the real product.

### What gets built

**1. Route + scaffolding**
- New page `src/pages/Presentation.tsx` mounted at `/presentation` (public route, no auth required so you can present from any device/screen).
- Lazy-loaded in `src/App.tsx` alongside existing routes.

**2. Slide engine** (`src/components/presentation/`)
- `SlideDeck.tsx` — keyboard nav (←/→/Space/Esc/F), click zones, slide counter, progress bar, auto-hide cursor, fullscreen toggle via Fullscreen API.
- `SlideLayout.tsx` — 1920×1080 fixed canvas, `transform: scale()` to fit any viewport (works on laptop, projector, mobile).
- `SlideThumbnails.tsx` — optional grid view (press `G`) to jump to any slide.
- `Presenter.tsx` — small floating control: prev/next, slide #, exit.
- Brand-aware: Navy `#1A365D` + Gold `#D4A574`, MiCasa logo on every slide footer.

**3. The 20 slides** (tech partner angle)

| # | Slide | Visual |
|---|-------|--------|
| 1 | Title — "MiCasa BOS — A Compliance-Native Real Estate OS" | Logo, tagline, gradient |
| 2 | The problem — fragmented Abu Dhabi brokerage stack | 4-quadrant diagram |
| 3 | Our thesis — "Rules Execute, AI Advises" | Concept diagram |
| 4 | System architecture overview | Reuse `InvestorArchitectureDiagram` |
| 5 | Tech stack — React 18, Vite, TS, Supabase, Edge Functions | Logo grid |
| 6 | Data model — unified Contacts → Opportunities → Deals | ER-style diagram |
| 7 | Unified CRM — Pipeline kanban | **Screenshot** of `/crm` Pipeline tab |
| 8 | 360° Contact view + activity timeline | **Screenshot** of ContactDetail |
| 9 | Tasks inbox & analytics | **Screenshot** of CRM analytics |
| 10 | Lead qualification engine — score-based funnel | Reuse `LeadQualificationLogic` |
| 11 | Deal lifecycle & workflow gates | Stage-flow diagram |
| 12 | Compliance automation — DARI / Tawtheeq / Madhmoun / BRN | Portal-evidence map |
| 13 | AML/KYC + audit-ready closeout | Diagram |
| 14 | Mi Ai — advisory AI with prompt builder & FAQ | **Screenshot** of Mi Ai |
| 15 | Mortgage suite — AECB, DBR, residency caps | Diagram |
| 16 | Onwani address lookup + Natoor sync | Integration map |
| 17 | Document engine — addendum strategy + naming standards | Layered diagram |
| 18 | Security model — RLS, roles, edge function auth standard | Diagram |
| 19 | Extensibility — secondary client pattern, edge function standard, Lovable AI gateway | Integration diagram |
| 20 | Roadmap + "Where you fit in" — partnership CTA | Timeline |

**4. Screenshots (3–4 hero shots)**
Capture from the running app: Pipeline kanban, Contact 360° view, Mi Ai chat, Architecture diagram. Saved to `src/assets/presentation/` and embedded.

**5. Reuse existing assets**
- `InvestorArchitectureDiagram`, `LeadQualificationLogic`, `ExecutiveSummary`, `MarketContextSlide` from `src/components/architecture/` — rendered inside slide frames where they fit.
- `MiCasaLogo` for branding.

### Controls

- `→` / `Space` / click right — next
- `←` / click left — previous
- `F` — fullscreen toggle
- `G` — grid overview
- `Esc` — exit fullscreen
- `1`–`9` — jump to slide

### Out of scope

- Speaker notes panel, PDF export, audience-sync via BroadcastChannel, slide editor. (Can add in a follow-up if you want.)

### How to demo

After build, navigate to `/presentation`, press `F` to go fullscreen, advance with arrow keys. All screenshots are baked in so it works offline / on any network.

Reply **go** to build it.

