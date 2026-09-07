---
paths:
  - "scripts/**"
  - "docs/**"
  - "CHANGELOG.md"
---

# Versions and release history

## Why this matters more than it looks

`docs/launch-runbook.md` makes the point: **you cannot scope a breach you cannot
date.** The exposure window in a PIPA notification comes from git history —
every deploy is a commit with a timestamp, and GitHub Pages build logs show when
each went live. Release hygiene is not bookkeeping here, it is the input to a
72-hour regulatory notice.

## Rules

- **One logical change per commit**, with a message that says what changed and
  why. "Update site" is useless in an incident.
- **Prefix a commit with a launch-kit rule ID when the change exists to satisfy
  one** — `RMG-06: exclude gambling ad categories`. That is how a future audit
  traces a rule to the code that answers it.
- **Tag releases.** Anything that changes what visitors receive gets an
  annotated tag. Untagged deploys are indistinguishable in a hurry.
- **`main` is live.** There is no staging. A push is a deploy, so a broken
  `main` is a broken site — never push a half-finished change to it.
- Record notable changes with dates. The runbook, these rules, and the legal
  pages each carry their own history; keep them consistent rather than merging
  them into one log.

## Before a release that changes visitor-facing behaviour

1. `sh test/run.sh`
2. `sh scripts/preflight.sh`
3. If it touches money display, settlement, ads, or the policy pages, re-read
   `10-real-money.md` and `40-privacy.md` first.
