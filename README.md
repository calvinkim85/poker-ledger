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
| `manifest.webmanifest`, `icon.svg` | Home-screen install metadata. |
| `robots.txt`, `sitemap.xml`, `og.png` | Search and social-preview metadata. |
| `tools/make-zip.sh`, `.githooks/` | Keep `poker-ledger-project.zip` in step with the repo. |
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

**Always `git pull` first.** The site can be edited from three places — this folder, github.com
in a browser, or a Claude Code session — and pulling before you start is what stops two of
them fighting. If you edit on github.com and then someone edits here without pulling, the
push is rejected as non-fast-forward. Nothing is ever lost when that happens (everything is
committed), but it is a merge you didn't need to do.

```sh
# 1. edit index.html
# 2. run the tests (see below)
git pull
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

154 assertions cover the money parsing and formatting, the settlement algorithm, the
gap-splitting rule (including a 400-table randomised property test asserting that the books
always balance and nobody ever changes placing), currency switching, the `localStorage`
migrations, and the site metadata — the canonical URL, Open Graph tags, sitemap and
`robots.txt` are asserted to name the same site, so a domain change cannot half-land. They
are the gate before any push.

## The project zip

`poker-ledger-project.zip` in this folder is a snapshot of the whole project, refreshed
**automatically after every commit and every pull** by git hooks in `.githooks/`.

It is built from `HEAD` with `git archive`, not from the working tree, which means it always
contains exactly what is on GitHub. That is the point: a zip that could quietly differ from
the deployed site would be worse than no zip at all.

```sh
sh tools/make-zip.sh      # rebuild by hand any time
```

Two things worth knowing:

- **Uncommitted edits are not in it.** The zip tracks the last commit, so it updates when you
  commit, not when you save. This is deliberate — it is what keeps the zip and GitHub
  identical.
- **Editing on github.com updates it on your next `git pull`**, via the `post-merge` hook.
  Until you pull, the local zip describes the older version.

The hooks are enabled per clone with `git config core.hooksPath .githooks`, already set here.
The zip is git-ignored — committing a zip of the repo into the repo would add a fresh binary
copy of everything to the history on every commit.

GitHub also offers a **Download ZIP** button on the repo page, which is always current and
needs no maintenance at all; the local zip exists so there is a copy on your own disk.

## Putting it on your own domain

The free `github.io` URL works fine, but a domain you own is required for Google AdSense and
looks better anywhere. Google Domains no longer exists — Google sold it to Squarespace in
2023 — so register with Cloudflare (at cost), Porkbun, or Namecheap.

1. Add a `CNAME` file to this repo containing just the bare domain.
2. At the registrar, point the apex at GitHub with four `A` records — `185.199.108.153`,
   `185.199.109.153`, `185.199.110.153`, `185.199.111.153` — and add a `CNAME` for `www`
   pointing to `calvinkim85.github.io`.
3. In **Settings → Pages**, set the custom domain and, once the certificate issues, tick
   **Enforce HTTPS**.
4. Update the canonical URL in `index.html`, plus `sitemap.xml` and `robots.txt`. The test
   suite fails if you miss one.

The old URL keeps working and redirects, so shared links don't break.

## Getting it into Google

`robots.txt`, `sitemap.xml` and the canonical tag are already in place. The rest needs your
Google account: add the site at [Search Console](https://search.google.com/search-console),
verify by DNS `TXT` record, submit `sitemap.xml`, then use **URL Inspection → Request
indexing**. Expect days to weeks before it appears — indexing can't be bought or hurried.

## A known limitation

Saved games live in the browser's own storage, so a night entered on your phone will **not**
appear on your iPad. The app travels between devices; the data doesn't.
