# Poker Ledger — project directions

Home poker ledger. Enter buy-ins and cash-outs for 2–9 players, get who pays
whom in the fewest transfers.

- **Static site.** HTML, CSS, vanilla JS. No build step for the site itself.
- **No server, no database, no accounts.** Game data never leaves the visitor's
  browser. This is the single most important fact about the project — most
  privacy and security obligations collapse because of it, and any change that
  breaks it re-opens all of them.
- Hosted on GitHub Pages from `main`. Custom domain, Let's Encrypt TLS.
- `sh scripts/preflight.sh` says what is still missing before launch.
- `docs/launch-runbook.md` is the human runbook. It is canonical for launch
  order, rollback, and PIPA breach handling — do not restate it here.

**Status as of 6 Sep 2026: preflight green, not yet on a custom domain.** The
three placeholders are filled, the draft banners are off, both policies are
live, and the test suite is green (840 assertions, 14 suites). Preflight's three
remaining notes are: no custom domain, advertising off (no publisher ID), and
that both are expected until AdSense approval.

**Do not restate status here again.** Run `sh scripts/preflight.sh` — it is
authoritative and this line went stale within three hours of being written.

## The rules are split by topic

`.claude/rules/` holds the detail. Files load automatically when Claude reads
matching files — the design rules arrive when you open a stylesheet, the privacy
rules when you open a policy page. Two files carry no `paths:` and are always in
context: `00-core.md` and `10-real-money.md`.

| File | Loads when |
|---|---|
| `00-core.md` | always |
| `10-real-money.md` | always — legal classification, never optional |
| `20-design.md` | CSS, HTML |
| `30-security.md` | JS, scripts |
| `40-privacy.md` | policy pages, consent code |
| `50-website.md` | HTML, SEO and crawl files |
| `60-mobile.md` | manifest, icons |
| `70-operations.md` | scripts, docs, tests |
| `80-versions.md` | scripts, docs — release history and tagging |
| `90-hosting.md` | scripts, docs, DNS and deploy files |

Changes to any of them go in `CHANGELOG.md` with a date.

## If a request conflicts with a rule

Stop and say so before implementing. Do not implement it and flag it afterwards.
The rules in `10-real-money.md` in particular are not style preferences — they
are what keeps the product outside gambling regulation.
