---
paths:
  - "*.css"
  - "*.html"
  - "guides/**/*.html"
---

# Design

Source: `launch-kit/01-design/`.

- **Use the existing tokens in `site.css`.** If a needed value does not exist,
  stop and ask — a new token is a design decision, not an implementation detail.
  The brand colour is `#14523c`, carried in `manifest.webmanifest` as both
  `background_color` and `theme_color`; changing one means changing both.
- Every interactive state exists: default, hover, focus-visible, active,
  disabled, loading, empty, error. Empty states are the ones that get skipped —
  a ledger with no players yet must say something useful.
- Loading feedback under ~300ms is worse than none. Above it, prefer skeletons
  to spinners for content that has a shape.
- Motion 150–300ms, and honour `prefers-reduced-motion`.
- **Credibility copy must be true.** Do not add statistics, testimonials, user
  counts, or review scores. `launch-kit` HANDOFF §3 lists design statistics that
  were deliberately removed for being untraceable; do not reintroduce them or
  their cousins.
- The guides under `guides/` are content, not chrome. They carry the site's
  credibility — keep them specific and free of filler.
