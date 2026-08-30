# If you want to put Google ads on this

Nothing here loads any advertising today. This file is the honest version of what turning it
on would take, and what to expect.

## Read this part first

Four things are worth knowing before you spend an afternoon on it.

**AdSense will not accept a `github.io` address.** Google requires a site on a domain you own
and control. The current free URL is a subdomain of `github.io`, which belongs to GitHub, so
the application cannot succeed as things stand. A domain is roughly $10–15/year.

**Single-purpose calculators are commonly rejected.** The most frequent AdSense rejection is
"low value content," and a page that is one tool with almost no reading material is squarely
in that category. Passing review would mean adding genuine written content — rules for
settling a home game, an explanation of the chip-count discrepancy problem, that sort of
thing — not just flipping a switch.

**Poker is gambling-adjacent.** Google restricts gambling and games content, with rules that
vary by country. This page tracks a friendly game and facilitates no wagering, so it is
probably fine, but it is an additional reason a reviewer might say no. I can't predict that
outcome.

**The money is not real at this scale.** AdSense pays out at $100. A page used by a handful
of friends once a month will not reach that in any reasonable timeframe. If the goal is to
cover the domain cost, a "buy me a coffee" link will do better and won't slow the page down.

None of this is a reason not to do it — it's a reason to do it with clear expectations.

## What's already in place

- **`ads.txt`** is served from the site root. It contains only comments; the real publisher
  line goes in after approval.
- **A reserved slot** — `<aside class="adslot" id="adslot" hidden>` sits below the
  settlement in `index.html`. It is `hidden`, so it renders nothing and shifts no layout
  until something is deliberately put in it.

Both mean that enabling ads later is an edit, not a rebuild.

## The steps, in order

1. **Buy a domain.** Cloudflare Registrar sells at cost; Porkbun and Namecheap are fine too.
2. **Point it at GitHub Pages.** Add a `CNAME` file to this repo containing the bare domain,
   then create these DNS records at your registrar:
   - Four `A` records for the apex: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - One `CNAME` for `www` → `calvinkim85.github.io`
   Then in the repo's **Settings → Pages**, set the custom domain and tick **Enforce HTTPS**.
   Certificates take a few minutes to issue.
3. **Add real content**, for the reason in the second warning above.
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

## One thing that will not work

The Claude artifact version of this page can never show ads. Its sandbox only permits scripts
from a short allowlist of CDNs, and `pagead2.googlesyndication.com` isn't on it — the request
is blocked with no visible error. GitHub Pages is the only one of the two that can carry
advertising.

## Keeping the page fast

If you do go ahead: load the script `async` (as above), keep to a single unit, and give its
container a fixed `min-height` so the page doesn't jump when the ad arrives. The entire app
is currently one ~50KB file with no dependencies, and one ad tag is comfortably the heaviest
thing that would ever be on it.
