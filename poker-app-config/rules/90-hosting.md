---
paths:
  - "scripts/**"
  - "docs/**"
  - "ads.txt"
  - "consent.js"
  - "robots.txt"
---

# Hosting, deployment, and advertising

## Where things live

| Thing | Where | Managed at |
|---|---|---|
| Hosting | GitHub Pages, from `main` | Repo Settings → Pages |
| Domain | `[[SITE_URL]]` | Your registrar. Keep the contact email current and separate from the domain itself |
| TLS | Let's Encrypt, auto-renewed by GitHub | Nothing to do; verify after any DNS change |
| Advertising | Google AdSense | adsense.google.com |
| Secrets | **There are none.** No API keys, no tokens, no env files | — |

**Keep the secrets row true.** A static site with no credentials cannot leak
them. Any change that introduces a key is a change to the project's risk
profile, not a configuration detail — say so before making it.

## Deploy

Push to `main`. That is the deploy. `git revert HEAD && git push` is the
rollback, live in ~45 seconds.

Enforce HTTPS must stay on in repo settings. Verify it after any DNS change —
a custom domain change can silently reset it.

## Advertising — the live compliance edge

`ads.txt` is scaffolded and sells nothing yet; AdSense is not enabled. When it
is, two rules bind at once:

- **RMG-06 — gambling, betting and casino ad categories must be excluded.**
  Google Play's real-money-gambling policy bans "management of participation
  funds" companion functionality in apps that display gambling advertising. A
  settlement ledger *is* that functionality. The ledger alone is fine; the
  ledger plus gambling ads is the violation. Set the category blocks in the
  AdSense console before the first impression and keep a dated screenshot.
- **Ad networks profile visitors.** That is "monitoring behaviour" under GDPR
  Art. 3(2) and is the single thing most likely to pull this project into EU
  scope. Re-read `40-privacy.md` EUG-01 before enabling, not after.

Also: a github.io subdomain faces much steeper AdSense scrutiny than a real
domain, which is why the custom domain comes first in the launch order and not
last.
