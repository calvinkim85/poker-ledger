---
paths:
  - "manifest.webmanifest"
  - "icon.svg"
---

# Mobile

**There is no app store submission today.** This is a PWA — installable, but
distributed as a website. `launch-kit/05-mobile/00-mobile.md` (store review
gates, iOS, Play, OWASP Mobile Top 10) does **not** currently apply, and this
file is deliberately short rather than padded with rules that do not bind.

What does apply now:

- The manifest declares `display: standalone`, `orientation: portrait`, scope
  `./`. Changing scope or `start_url` breaks installed instances silently.
- `theme_color` and `background_color` are `#14523c` and must match `site.css`.
- The single SVG icon is `purpose: any maskable`. If raster icons are added,
  180×180 and 512×512 are the ones that matter.
- Test an actual install on iOS Safari and Android Chrome before claiming the
  PWA works. Installed behaviour differs from a browser tab.

**If this is ever wrapped for the App Store or Play**, load
`launch-kit/05-mobile/` in full **and** `10-real-money.md` — the real-money
classification questions become live gates at that point, and AND-06 alone adds
at least three weeks of closed testing.
