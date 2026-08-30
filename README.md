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
| `test/` | The suite; `sh test/run.sh` runs it. |
| `ads.txt` | Placeholder; see *Putting ads on this* below. |

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

---

# Putting ads on this

Nothing here loads any advertising today. This file is the honest version of what turning it
on would take, and what to expect.

### Read this part first

Four things are worth knowing before you spend an afternoon on it.

**AdSense will not accept a `github.io` address.** Google requires a site on a domain you own
and control. The current free URL is a subdomain of `github.io`, which belongs to GitHub, so
the application cannot succeed as things stand. A domain is roughly $10–15/year.

**Single-purpose calculators are commonly rejected.** The most frequent AdSense rejection is
"low value content," and a page that is one tool with almost no reading material is squarely
in that category. ~~This site has that problem.~~ **Addressed:** the guide under the
calculator covers settling a home game, why chip counts miss, and the house rules worth
agreeing beforehand. Keep it that way — if it ever gets gutted, this problem comes back.

**Poker is gambling-adjacent.** Google restricts gambling and games content, with rules that
vary by country. This page tracks a friendly game and facilitates no wagering, so it is
probably fine, but it is an additional reason a reviewer might say no. I can't predict that
outcome.

**The money is not real at this scale.** AdSense pays out at $100. A page used by a handful
of friends once a month will not reach that in any reasonable timeframe. If the goal is to
cover the domain cost, a "buy me a coffee" link will do better and won't slow the page down.

None of this is a reason not to do it — it's a reason to do it with clear expectations.

### What's already in place

- **`ads.txt`** is served from the site root. It contains only comments; the real publisher
  line goes in after approval. A test asserts it stays comment-only.
- **A reserved slot** — `<aside class="adslot" id="adslot" hidden>` sits below the
  settlement in `index.html`. It is `hidden`, so it renders nothing and shifts no layout
  until something is deliberately put in it.
- **The guide** — roughly 1,000 words under the tool, addressing the "low value content"
  problem directly. This was the single biggest obstacle and it is now done.
- **`robots.txt`, `sitemap.xml`, canonical and Open Graph tags** — so the site is
  crawlable and presents itself properly.

What remains before an application is realistic: **a domain**, and enough of a track record
that the site looks alive. Enabling ads after that is an edit, not a rebuild.

### The steps, in order

1. **Buy a domain.** Cloudflare Registrar sells at cost; Porkbun and Namecheap are fine too.
   Note that Google Domains shut down in 2023 — the business went to Squarespace, so there is
   no Google registrar to use.
2. **Point it at GitHub Pages.** Add a `CNAME` file to this repo containing the bare domain,
   then create these DNS records at your registrar:
   - Four `A` records for the apex: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - One `CNAME` for `www` → `calvinkim85.github.io`
   Then in the repo's **Settings → Pages**, set the custom domain and tick **Enforce HTTPS**.
   Certificates take a few minutes to issue.
3. ~~Add real content.~~ Done — see the guide in `index.html`.
4. **Apply** at <https://adsense.google.com>. You'll add the site, paste a verification
   snippet into `<head>`, and wait. Review commonly takes a few days and can take weeks.
5. **On approval**, replace the contents of `ads.txt` with the single line AdSense gives you:
   ```
   google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
   ```
6. **Then, and only then**, add the loader to `<head>`:
   ```html
   <script async crossorigin="anonymous"
           src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOURID"></script>
   ```
   and fill the reserved slot with your unit, removing the `hidden` attribute.
7. **Verify your address.** Google mails a PIN once you pass $10 in earnings; the account is
   suspended until you enter it.

Don't do step 6 before step 4 succeeds. An unapproved loader serves nothing and costs every
visitor a round trip to Google on page load.

### One thing that will not work

The Claude artifact version of this page can never show ads. Its sandbox only permits scripts
from a short allowlist of CDNs, and `pagead2.googlesyndication.com` isn't on it — the request
is blocked with no visible error. GitHub Pages is the only one of the two that can carry
advertising.

### Not to be confused with Google Ads

These are opposite transactions and the names invite mixing them up:

- **AdSense** — Google pays *you* to show ads on your page. This document.
- **Google Ads** — *you* pay Google to appear at the top of search results.

If the goal is to be found quickly rather than to earn, Google Ads is the lever, and it costs
money per click rather than earning it. Organic ranking is a third thing again: no money, but
it needs content, links, and months.

### Keeping the page fast

If you do go ahead: load the script `async` (as above), keep to a single unit, and give its
container a fixed `min-height` so the page doesn't jump when the ad arrives. The entire app
is currently one ~50KB file with no dependencies, and one ad tag is comfortably the heaviest
thing that would ever be on it.
