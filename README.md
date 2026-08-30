# Poker Ledger

A single-page tool for settling a home poker game. Enter what each of 2–9 players bought in
for and what they cashed out, press Calculate, and it works out who pays whom in as few
transfers as possible.

**Live: https://calvinkim85.github.io/poker-ledger/**

- **Rebuy chips** — each buy-in stays a separate entry, so the record shows who rebought and
  how often.
- **Seven currencies** — KRW, USD, JPY, CNY, EUR, GBP, SGD. Yen and won correctly have no
  decimal places.
- **A discrepancy check** — if the chips don't match the buy-ins, it says so, in which
  direction, and by how much.
- **"Cover the gap from the top"** (optional) — lands that difference on the players who
  finished ahead, splitting it between them when they finished close, and never changing
  anyone's placing.
- **Copy settlement** — plain text for the group chat.

Everything runs in the browser. No accounts, no server, nothing uploaded.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire app — markup, styles, and script in one file. |
| `tic-tac-toe.html` | An unrelated earlier page, at `/tic-tac-toe.html`. |
| `manifest.webmanifest`, `icon.svg` | Home-screen install metadata. |
| `ads.txt` | Placeholder; see `ADSENSE.md`. |
| `CLAUDE.md` | Architecture notes and the rules to follow when editing. |

## Running it locally

```sh
open index.html
```

That's it — no build step, no package manager, no dependencies. The Google Fonts `<link>` is
the only remote resource; the app itself works offline.

## Updating the site

`index.html` in this folder is the only source of truth. There is no build output and no
second copy to keep in sync.

```sh
# 1. edit index.html
# 2. run the tests (see below)
git add -A
git commit -m "what changed"
git push
```

GitHub Pages rebuilds automatically. The change is live in **about 45 seconds** — measured on this repo, not estimated. Two things worth knowing:

- Browsers cache hard. If you don't see the change, hard-refresh (**⌘⇧R**). An installed
  home-screen app may need closing and reopening.
- You can also edit `index.html` directly on github.com and commit there. It deploys exactly
  the same way, so the site can be fixed from a phone with no laptop involved.

## Adding it to a phone or tablet

Open the live URL in Safari, then **Share → Add to Home Screen**. It gets a proper icon and
opens full-screen with no browser chrome. Chrome on Android offers the same through
**Install app**.

## Tests

There's no test runner and no `node` on the development machine, so the suites extract the
pure functions straight out of `index.html` and run them under macOS's built-in
JavaScriptCore:

```sh
osascript -l JavaScript test/<suite>.js
```

135 assertions cover the money parsing and formatting, the settlement algorithm, the
gap-splitting rule (including a 400-table randomised property test asserting that the books
always balance and nobody ever changes placing), currency switching, and the `localStorage`
migrations. They are the gate before any push.

## A known limitation

Saved games live in the browser's own storage, so a night entered on your phone will **not**
appear on your iPad. The app travels between devices; the data doesn't.
