---
paths:
  - "*.html"
  - "sitemap.xml"
  - "robots.txt"
  - "404.html"
  - "site.css"
---

# Website

Source: `launch-kit/04-web/` (WEB-01…23) and `01-design/30-credibility.md`.

- **Placeholders are load-bearing.** `[[OPERATOR_NAME]]`, `[[CONTACT_EMAIL]]`,
  `[[SITE_URL]]` render as visible amber TODO chips on purpose. Do not fill them
  by hand and do not style them away — `sh scripts/configure-launch.sh` fills all
  three across every page plus canonical URLs, Open Graph, sitemap, robots.txt,
  404 root paths, and CNAME.
- Any new page needs: a canonical URL, an Open Graph title/description/image, an
  entry in `sitemap.xml`, and a route that works from the custom domain and from
  the 404 fallback.
- Accessibility to WCAG 2.1 AA. Keyboard-only completion of a full ledger entry
  is the test that matters, not an automated scan score.
- Forms: every input labelled, errors announced, and no data lost on a failed
  submit.
- Do not add render-blocking third-party resources. The site's speed is a
  feature and it is currently free.
