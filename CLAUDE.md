# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Two independent, self-contained pages. Each is one HTML file (markup + inline `<style>` +
one IIFE `<script>`) with no package manager, no build step and no dependencies. They share
no code — only conventions. The poker ledger has a test suite; see below.

`index.html` is a poker buy-in / cash-out settlement tracker, and it is the whole site. The
tic-tac-toe game that used to live here now has its own repo and Pages site
(<https://github.com/calvinkim85/tic-tac-toe>); the architecture notes below are kept because
the two pages still share conventions.

## Running

```sh
open index.html           # macOS: opens in the default browser
```

Or serve the folder (VS Code Live Server) for reload-on-save. Editing means editing the
HTML file directly.

## Deploying

The repo **is** the site: `index.html` here is the file GitHub Pages serves at
<https://calvinkim85.github.io/poker-ledger/>. There is no build step and no second copy, so
never introduce one — a generated artefact alongside the source is exactly how the tested
file and the live file drift apart.

```sh
git pull                  # ALWAYS first — see below
sh test/run.sh            # 154 assertions; the gate before any push
git commit -am "..." && git push
```

**Project layout.** `Claude Code Test/` is where this user's projects live — put new work
there by default, never elsewhere, unless they name a different location. It is currently
also the poker-ledger repo root, so a sibling project sits in a subfolder with its own git
repo (`tic-tac-toe/`) and is git-ignored here.

**The zip.** `tools/make-zip.sh` rebuilds `poker-ledger-project.zip` from `HEAD` via
`git archive`, wired to `post-commit` and `post-merge` hooks in `.githooks/`
(`core.hooksPath` is set locally). Building from `HEAD` rather than the working tree is the
whole point — the zip must never be able to disagree with what is on GitHub. It is
git-ignored; committing it would add a binary copy of the repo to the repo on every commit.

**Pull before you touch anything.** This repo is edited from three places: this folder, the
github.com web editor, and Claude Code sessions. A commit made on github.com leaves the local
copy behind, and editing stale files turns a trivial change into a merge. Pulling first costs
a second and removes the whole class of problem.

Pages redeploys on push; measured push-to-live latency on this repo is ~45s.

## Tests

`test/run.sh` rebuilds the suites with `test/build.py`, which extracts the pure functions
straight out of `index.html` — extraction rather than duplication is deliberate, so a suite
cannot drift from the code under test. Cases live in `test/cases/`, each declaring
`// needs: core`, `// needs: storage`, or `// needs: site` on its first line; `test/build/` is
generated and git-ignored. The runner exits non-zero if any assertion fails.

The `site` prelude hands a case the raw text of `index.html` and the crawler files, which is
how `site-metadata.js` asserts that the canonical URL, `og:url`, `og:image`, `sitemap.xml` and
`robots.txt` all name the same site. Changing the domain means changing all of them; that
suite is what stops the migration half-landing and going unnoticed until Search Console
reports duplicate content weeks later.

Google Fonts load from the CDN via a `<link>` — Bodoni Moda + IBM Plex Sans/Mono. Display
typography needs a network connection; the page itself runs fully offline.

**The guide.** The `<details class="guide">` block under the tool is not decoration. A page
that is pure interface has nothing for Google to rank and reads as "low value content" to an
AdSense reviewer — the ~1,000 words fix both at once. Keep it genuinely useful and keep the
heading structure; thin text written for crawlers is what gets a site rejected.

## Architecture — tic-tac-toe.html

**Central state.** One `state` object (`board`, `turn`, `over`, `mode`, `diff`, `scores`)
is the source of truth. `updateStatus()` is the single re-render point for the status line
and for the grid's `turn-x` / `turn-o` / `locked` classes — call it after a state change
rather than toggling those classes ad hoc.

**Move flow.** `handleMove()` (guards) → `applyMark()` (writes the board, appends the SVG
mark, checks `getWinner()` / `isFull()`) → `endGame()`, or else `updateStatus()` +
`maybeCpu()`.

**CPU opponent.** Human is always `X` and opens. `maybeCpu()` schedules the reply on a
`setTimeout` tracked in `cpuTimer` (cleared on new round). `perfectMove()` runs full
`minimax()` and is unbeatable; `casualMove()` is a take-the-win / usually-block heuristic
and is beatable.

**Theming.** Colors are CSS custom properties defined in three blocks: bare `:root`
(light), `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`,
and `:root[data-theme="dark"]`. JS `themeState` cycles `auto → dark → light`, stamping
`data-theme` on `<html>` (`auto` removes the attribute). New colors must be tokens defined
in all three blocks, never literals inside a media or `[data-theme]` block.

**Persistence.** `localStorage` key `ttt.blueprint.v1` holds `scores`, `mode`, `diff`,
`theme`. Every access is wrapped in try/catch — the game must still work when storage
throws or returns nothing.

**Rendering details.** `buildGrid()` creates the nine cell `<button>`s and wires clicks;
arrow-key navigation is delegated on the grid container. `makeMark()` builds each X/O as
inline SVG animated via `stroke-dashoffset`; `drawWinLine()` draws the winning stroke into
the `#winline` SVG overlay. The `RM` flag (`prefers-reduced-motion`) short-circuits both
animations.

## Architecture — index.html (poker ledger)

**Money is an integer count of minor units, everywhere.** The scale is the active
currency's, not a constant: `minor(code)` is `10^dec`, so USD is cents (×100) while JPY and
KRW have `dec: 0` and store whole yen and won. `parseMoney()` returns minor units (or
`null` for unusable text; blank is `0`, so an empty cash-out reads as "busted" rather than
an error), and `fmt()` / `fmtSigned()` / `toInput()` are the only places minor units become
a displayed amount. Never hold money as a float — that is what keeps stray sub-unit
residuals out of the settlement list.

**Currencies.** The `CURRENCIES` table owns each currency's symbol, precision, and locale;
`Intl.NumberFormat` is used only to group digits, never with `style:"currency"`. That is
deliberate: in their own locales `Intl` renders SGD as a bare `$` (identical to USD) and
CNY as `¥` (identical to JPY), so locale symbols would put two currencies behind one glyph.
`SGD` and `CNY` therefore carry the disambiguating `S$` and `CN¥`. Adding a currency means
adding a row to the table and its code to `CURRENCY_ORDER` — nothing else.

**Switching currency relabels, it does not convert.** `convertAll(from, to)` re-quantizes
the major-unit value, so `$20.00` becomes `₩20`; there are no exchange rates and no network
call. It returns whether any value actually changed under the round-trip, which is what
raises the "amounts were rounded" notice. A switch also clears any showing settlement — one
priced in dollars must never sit on screen under won labels.

**Central state.** One `state` object (`players`, `defaultBuyIn`, `currency`) plus
`themeState`. A player is `{ name, buyIns: [units], cashOut: units }` — `buyIns` is an
array so each rebuy stays a separate visible entry. `totalIn(p)` sums it; `netOf(p)` is
`cashOut - totalIn`.

**Rendering.** `render()` rebuilds every seat from state and ends by calling
`updateTally()`, so callers only ever need `render()`. `updateTally()` refreshes just the
live "Total in" / "Net" spans in place — typing in a field must never trigger a full
`render()`, or focus and caret position are lost mid-entry.

**Settlement.** `settleNets(entries)` does greedy debtor/creditor matching over
`[{name, net}]`, yielding at most n−1 transfers; `settle(players)` is a thin wrapper that
builds those entries via `netOf()`. The split exists so `calculate()` can settle *adjusted*
nets — keep the greedy body in `settleNets()` alone. When the books do not balance the two
sides cannot both empty; the leftover is returned as `unpaid` (winners who cannot be paid) /
`unowed` (losers with nobody to pay) and is reported rather than smoothed away.

**Splitting the gap (opt-in, `state.absorb`).** `splitFromTop(mags, total)` divides a gap
**equally** among the fewest top players who can take it without disturbing the order — the
leader alone, else half each, else thirds, else fourths. Equal shares are the whole point:
subtracting the same amount from everyone in the group leaves the differences between them
untouched, so the ranking survives by construction. Do not "improve" this into a
water-filling / level-to-a-common-line scheme — that was the previous implementation and it
was replaced precisely because it ties players together and can invert them.

Group selection is the smallest `k` satisfying
`mags[k-1] - ceil(total/k) > (k < n ? mags[k] : -1)`. Two details are load-bearing:
`ceil`, because the group's lowest member is the one who pays the odd minor unit, so the
test must be against what they actually pay; and the `-1`, which is the integer spelling of
"may end at exactly zero" — below the last winner there is nobody to tie with. Every other
comparison is strict, because landing exactly level counts as losing the spot. The `total % k`
odd unit goes to the **bottom** of the group — handing it to the leader is what could put
them a unit behind second place.

When no `k` qualifies (the gap outruns the winnings, e.g. `[20, 10]` against 25) it falls
back to an equal split across everyone, zeroing whoever cannot cover their share and
re-dividing the rest. That path can finish several players at zero together; it is only
reachable on a wild miscount.

`absorbGap(entries, diff)` picks the side from the sign — `diff > 0` means the chips claim
more than went in, so **winners' profits** are cut; `diff < 0` means the losers owe more than
anyone claims, so **losers' debts** are cut, and the biggest loser still owes the most.

This always balances exactly, which is why the absorbed path never has a residual. With `W`
the total winnings and `Lo` the total losses, `diff = W - Lo`. For `diff > 0`,
`diff = W - Lo ≤ W`, so there is always enough to take, and winners then total `W - diff =
Lo` — precisely what the losers owe. For `diff < 0` the mirror holds. A change that breaks
either that identity or the ordering guarantee will show up in the randomized property test,
which asserts both over 400 tables.

`calculate()` renders the discrepancy banner, the transfer list, and the per-seat summary,
adding an "After the split" column only when the split actually applied.

**Theming.** No auto mode here — unlike `tic-tac-toe.html`, `themeState` is only ever
`dark` or `light` and `applyTheme()` always stamps `data-theme`. `systemTheme()` reads
`prefers-color-scheme` **once**, to seed a first visit or to migrate a stored `"auto"` left
by an older save; the page never follows the OS after that. Keep all three token blocks
anyway: the `prefers-color-scheme` block still governs the moment before the script stamps
the attribute, and dropping it flashes the wrong theme on load.

**Persistence.** `localStorage` key `poker.ledger.v1` holds `players`, `defaultBuyIn`,
`currency`, `absorb`, `theme`, saved on every change. It is per-browser, so a game entered
on one device does not appear on another — a known limitation, recorded in the README. `load()` re-validates every field — a
hand-edited or truncated payload must not be trusted into state. A missing or unrecognized
`currency` **must** default to `"USD"`: payloads written before currencies existed hold USD
cents, and without that default a saved `2000` silently reappears as ₩2,000.

## Constraints

- Keep each page in its own single HTML file — no external JS or CSS assets, and no shared
  files between the two. The font `<link>` is the only remote resource. This rule is about
  *app code*: site-level metadata that has to be a separate file to work at all
  (`manifest.webmanifest`, `icon.svg`, `ads.txt`, a future `CNAME`) is not a violation. The
  home-screen icon is inlined as a `data:` URI in the head for exactly this reason.
- `ads.txt` is a comment-only placeholder and no advertising script is loaded. If that ever
  changes, `ADSENSE.md` has the order of operations — the loader goes in *after* approval,
  never before.
- Both pages use the same three-block token convention: bare `:root` (light),
  `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and
  `:root[data-theme="dark"]`. New colors must be tokens defined in all three blocks, never
  literals inside a media or `[data-theme]` block. `poker-ledger.html` is published as an
  Artifact, where the viewer's theme also arrives as `data-theme` on the root element, so
  this is a hard requirement there, not just a style preference. The two pages differ only
  in what they stamp: tic-tac-toe has an `auto` state that removes the attribute, the poker
  ledger always stamps a side.
- Every `localStorage` access stays wrapped in try/catch — both pages must work when
  storage throws or returns nothing.
