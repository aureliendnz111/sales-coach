# Homepage feature mockups, categories & global UX pass

Workflow: brainstorm → plan → execute → verify (Superpowers method).

## Problems found

- Homepage shows features as 4 flat cards + static PNG screenshots in a separate
  "Preview" section: two sections for the same message, screenshots go stale and
  are unreadable on mobile.
- Landing copy says Playground is "coming soon" (and Pro-only), but it is live in
  the app and free.
- No shared mental model between landing and app: the sidebar is a flat list.
- Dashboard has no primary actions once the user has a script; onboarding banner
  talks about the real-time copilot, which isn't available yet.
- Several app strings are French-only (mobile block, Live Copilot / Analytics
  placeholders) although the app is fr/en/pt.

## Design

Five categories, used both on the landing page and in the app sidebar:

| # | Category     | Feature(s)                 | Status    |
|---|--------------|----------------------------|-----------|
| 1 | Préparer     | Script Builder, Templates  | Available |
| 2 | S'entraîner  | Playground                 | Available |
| 3 | Analyser     | Call Analysis              | Available |
| 4 | Progresser   | Dashboard, progress        | Available |
| 5 | En direct    | Live Copilot               | Soon      |

### Landing (`src/app/page.tsx`)

- Replace the features grid + screenshot preview with one `FeatureShowcase`
  section: an accessible tab list of the categories (arrow-key navigation) and,
  per category, copy + bullets + a realistic **coded** mockup of the screen
  (HTML/Tailwind, no images → sharp, translated, responsive).
- Fix Playground status (available, free plan) in features, pricing and FAQ.

### App

- Sidebar: group nav items under category headings.
- Dashboard: quick-action cards (create script / practice / analyze) and a
  getting-started checklist instead of the single amber banner.
- i18n for the remaining French-only strings.

## Verification

- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Screenshot the landing page with Playwright at desktop and mobile width,
  cycling through each category.
