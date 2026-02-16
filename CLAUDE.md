# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SaveBox Prototype — SNS 콘텐츠 통합 북마크 서비스 (SNS content unified bookmark service). This is a **UI-only prototype** with no backend; all data is mocked client-side in `src/lib/prototypeData.js`. The interface is Korean-language throughout.

## Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run dev:clean        # Clean .next + dev on 127.0.0.1:3000
npm run dev:fix          # Kill existing processes + start clean dev
npm run build            # Production build
npm run lint             # Next.js linter
npm run stop             # Kill processes on ports 3000-3003
```

## Architecture

- **Framework:** Next.js 14 App Router with React 18, Tailwind CSS 3.4, no TypeScript
- **Import alias:** `@/*` maps to `./src/*` (configured in `jsconfig.json`)
- **Output:** Standalone mode (`next.config.mjs`)

### Route Groups

All pages live under `src/app/`:

- `(main-app)/` — Main 4-tab application (home, content, collections, search, settings)
- `(main-app)/layout.js` — Shared bottom navigation bar with 4 tabs
- `(main-app)/content/[id]/page.js` — Content detail with edit/share/delete via Sheet modal
- `share/page.js` — Share extension entry point

### UI Components (`src/components/ui/`)

Custom-built components (no component library). Key patterns:
- `cn()` utility from `src/lib/utils.js` for Tailwind class merging (uses `clsx` + `tailwind-merge`)
- Compound component pattern: `Card` (Header/Title/Description/Content), `Sheet` (with React Context)
- `asChild` prop pattern using `@radix-ui/react-slot` for polymorphic rendering

### Data Layer (`src/lib/prototypeData.js`)

All mock data and helpers in one file:
- `MOCK_CONTENTS` (11 items), `MOCK_COLLECTIONS` (5 items), `SNS_SOURCES`, `COLOR_TAGS`
- `SOURCE_META` — per-platform styling config (colors, labels) for Instagram, YouTube, X, Pinterest, TikTok, Threads
- Helper functions: `getCollectionCountMap()`, `getSourceMeta()`, `formatKoreanDate()`, `getRecentItems()`

### Icons

Uses `lucide-react` exclusively for all icons.

## Styling Conventions

- **Mobile-first:** All pages constrained to `max-w-[440px]` centered viewport
- **Color scheme:** Slate grays for neutrals, Indigo (`#6366f1`) as primary accent
- **Border radius:** `rounded-xl` to `rounded-2xl` (11px–20px)
- **Custom animations:** `slide-up` keyframe defined in `tailwind.config.mjs`; additional keyframes (`slideInFromRight4`, `zoomIn95`) in `src/styles/globals.css`
- **Tailwind config** scans only `src/app/` and `src/components/` directories

## Deployment

GitHub Pages via `.github/workflows/static.yml` — auto-deploys on push to main.
