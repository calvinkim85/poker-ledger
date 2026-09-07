---
paths:
  - "privacy*.html"
  - "terms.html"
  - "consent.js"
  - "docs/launch-runbook.md"
---

# Privacy

Sources: `launch-kit/03-privacy/00-mechanisms.md` (PRV), `10-jurisdiction.md`
(KR, KRG), `20-gdpr.md` (EUG). `docs/launch-runbook.md` §1 is canonical for
PIPA breach handling — do not duplicate it.

## What the invariant buys you

No server, no database, no accounts means there is **no store of user data to
breach**. Say that plainly in the policy rather than writing a generic notice
that implies otherwise. The honest description is the hard part and it is
already done — do not replace it with boilerplate.

## Korea PIPA — binds on market presence, not incorporation

A Korean-language page is enough. There is no small-operator exemption.
**Act No. 21445 takes effect 11 September 2026** — a punitive tier reaching 10%
of total turnover, and the representative director named in statute. For a solo
project that is a real person, which is why `[[OPERATOR_NAME]]` must be a legal
name, not "the team".

72-hour clock, Art. 34: notify affected subjects within 72 hours; report to
PIPC/KISA within 72 hours for 1,000+ subjects, sensitive or unique-ID data, or
illegal external access.

## The ledger is a record about people

Game history is a durable record of who staked what — evidence about the players
as much as data about them (KRG-04). Because it lives in browser storage, the
rule is: **the user must be able to clear it, and the policy must say where it
lives and that it never leaves the device.** If storage ever moves server-side,
retention and deletion become real obligations, not descriptions.

## GDPR — almost certainly not in scope

GDPR binds a non-EU controller on **targeting or monitoring** EU users, not on
the site being reachable from Europe (EUG-01). A Korea-facing static site with
no analytics reaching EU visitors is out of scope.

**Do not build consent architecture, an Art. 27 EU representative, or DSAR
machinery into this project on the assumption that GDPR applies.** If EU
targeting is ever deliberate, EUG-01 is a written gate to answer first.

Note the interaction: adding an ad network that profiles EU visitors is
monitoring behaviour. Advertising is the thing most likely to pull this project
into GDPR scope — see `90-hosting.md`.

## Policy text

`launch-kit` implements privacy *mechanisms* and flags policy text for human
review. **Do not draft or rewrite a privacy policy and call it compliant.** The
pages here are a careful description of what the site does; changing site
behaviour means the description needs updating, and that edit is a factual
correction, not new legal drafting.
