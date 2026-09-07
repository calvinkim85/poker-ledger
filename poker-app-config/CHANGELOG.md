# Changelog — poker-ledger project rules

Newest first. One entry per change, with a date.

## 2026-09-06 — KRG-01 downgraded, BLOCKER → HIGH

- **The §247 blocker was wrong.** It was written from the statute's text alone.
  대법원 2001도5802 defines 개설 as *"스스로 주재자가 되어 그 지배하에"* opening the
  venue — you must be the host, with the gambling under your control — and the
  profit must be consideration *for opening it* (entry fee, rake), not ad
  revenue from a tool. This product meets neither element.
- KRG-01 is now HIGH and asks for a **written determination**, not counsel.
  KRG-02 stays BLOCKER: it is the 주재자 test in checklist form, so breaching it
  changes the legal analysis rather than the rulebook.
- Lesson recorded in the kit's verification log: a criminal statute's maximum
  penalty is not a proxy for exposure, and reading a provision without the case
  law construing its operative element attaches a frightening severity to a rule
  that does not bind.

## 2026-09-06

- Split the single `CLAUDE.md` into `rules/` with ten topic files. Two are
  always-on (`00-core`, `10-real-money`); the other eight carry `paths:`
  frontmatter and load only when Claude reads matching files.
- Added `80-versions.md` (release hygiene, and why commit dates feed a PIPA
  breach notice) and `90-hosting.md` (GitHub Pages, TLS, no secrets, AdSense).
- **Corrected the retention rule.** The earlier draft treated the ledger as a
  server-side record. It is browser-local — the obligation is that the user can
  clear it and the policy says where it lives, not server retention scheduling.
- **Corrected the stack section.** The earlier draft had blanks for stack and
  commands; filled from the repo: static HTML/CSS/JS, `sh test/run.sh`,
  `sh scripts/preflight.sh`, GitHub Pages from `main`.
- Recorded that AdSense is scaffolded but not enabled, making RMG-06 a
  pre-launch gate rather than an audit finding.

## 2026-09-06 (earlier)

- First version: single `CLAUDE.md` with the six real-money constraints, KRG-01
  as an open blocker, and a GDPR out-of-scope note.
