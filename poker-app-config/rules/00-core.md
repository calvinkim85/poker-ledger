# Core — always loaded

## How to work in this repo

- **Confirm before large changes.** More than three files touched, or a change
  to how the settlement algorithm works, means describe the plan and wait.
- **Do not guess at unclear instructions.** Say what you understood and stop.
- **Verify before reporting done.** `sh test/run.sh` for the test suite,
  `sh scripts/preflight.sh` for launch readiness. Saying it works is not
  evidence.
- `test/build/` is generated from `index.html` by `test/build.py`. Never edit or
  commit anything in it.

## The invariant

**No server, no database, no accounts. Game data stays in the visitor's
browser.** Every privacy, security, and breach-response position in this repo
rests on that sentence. If a change would introduce a backend, a stored ledger,
an account system, or any transmission of game data off the device, it is not a
feature decision — it is a compliance decision. Stop and say so.

## Canonical sources, in order

1. `docs/launch-runbook.md` — launch order, rollback, PIPA breach handling.
2. `~/Desktop/launch-kit/` — the 312-rule audit rulebook. These files summarise
   it; where they disagree, the kit wins and these are stale.
3. These rules.
