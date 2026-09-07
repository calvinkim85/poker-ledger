---
paths:
  - "*.js"
  - "scripts/**"
  - "index.html"
  - "test/**"
---

# Security

Source: `launch-kit/02-security/` (SEC-01…60, mapped to OWASP Top 10:2025).

The attack surface is small because there is no server. What remains:

- **Supply chain is the real risk here.** A static site's danger is a
  third-party script — an ad tag, an analytics snippet, a font loader. Every
  external script is code you did not write running on your domain. Pin what you
  can, and treat adding one as a change worth describing first.
- **Injection into the DOM.** Player names are user input. Render them as text,
  never as HTML. `innerHTML` with a player name in it is the bug to look for.
- **No secrets in this repo, ever.** There are none today (see `90-hosting.md`)
  and that is a property worth keeping. No API keys, no tokens, no `.env`.
- Shell scripts in `scripts/` run against a live site's config. Quote variables,
  fail loudly, and never `curl | sh`.
- Security headers are set at the hosting layer, not in the markup — see
  `90-hosting.md`.

**These rules are competent practice, not citable facts.** `launch-kit`'s
verification log says the same about its own security file. A real review
replaces this rather than supplementing it if the invariant in `00-core.md` ever
breaks.
