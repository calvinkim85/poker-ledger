# Launch runbook

Everything that is not code and has to be true before this site carries advertising.
Written to be followed by someone who is not the author.

**Status: not launched.** `sh scripts/preflight.sh` says what is still missing.

---

## 0. The three placeholders

The legal pages ship with `[[OPERATOR_NAME]]`, `[[CONTACT_EMAIL]]` and `[[SITE_URL]]`
rendered as visible amber TODO chips, and both policies carry a banner saying they are
drafts and not in force. Nothing about this is subtle, deliberately.

```sh
sh scripts/configure-launch.sh "Your Legal Name" "privacy@yourdomain.com" "yourdomain.com"
```

That fills all three across every page, rewrites the canonical and Open Graph URLs, the
sitemap, `robots.txt`, and the `404.html` root paths, and writes `CNAME`.

**These have not been reviewed by a lawyer.** They are a careful description of what the
site actually does, which is the hard part, but that is not the same thing as advice.

---

## 1. Korea PIPA — the parts that bind a one-person project

PIPA applies on **market presence, not incorporation**. A Korean-language page and KRW
as a supported currency is enough. There is **no small-operator exemption**.

**Act No. 21445 takes effect 11 September 2026.** Two changes that matter here:

- A punitive fine tier reaching **10% of total turnover** for repeat willful violations,
  incidents affecting 10m+ data subjects, or ignoring a PIPC corrective order.
- The **representative director / business owner is named in statute** as ultimately
  responsible. Not delegable. For a solo project that is you, personally, which is why
  `[[OPERATOR_NAME]]` is a real name and not "the team".

### The 72-hour clock

Article 34. If personal information is breached, you must:

- Notify **affected data subjects within 72 hours**.
- Report to **PIPC or KISA within 72 hours** if the breach involves 1,000+ data subjects,
  sensitive or unique identifying information, or illegal external access.

Filed through the KISA Privacy Portal at **privacy.kisa.or.kr** (개인정보침해 신고센터,
118). PIPC at **pipc.go.kr**.

**Who files: `[[OPERATOR_NAME]]`.** There is nobody else. If you are unreachable for 72
hours during a launch window, name a second person here before you launch.

### What a breach could actually be here

Worth stating plainly, because it shapes the response. The site has **no server, no
database, and no account system**. Game data never leaves the visitor's browser. There
is no store of user data to breach.

The realistic incidents are:

| Scenario | Is it a PIPA breach? | First action |
|---|---|---|
| GitHub account compromised, malicious JS pushed to the site | **Yes** — visitor data could have been exfiltrated | Revert, rotate, assess exposure window |
| A dependency or CDN serving altered script | **Yes**, same reasoning | Remove the reference, revert |
| GitHub Pages outage | No — availability, not confidentiality | Nothing to notify |
| Someone else's laptop with a saved game | No — that is their device, not our processing | Nothing to notify |

The first two are the ones to plan for, and both come down to the same thing: **you
cannot scope a breach you cannot date.** Which is why the next section matters.

### Scoping (OPS-20)

You cannot query who visited — there are no logs you control. What you *can* establish
precisely is the **exposure window**, from the git history: every deploy is a commit
with a timestamp, and GitHub Pages build logs show when each went live. That plus the
nature of the injected change is what a notification has to describe.

### Pre-drafted notice (KR-11)

Article 34 requires five elements. Fill the brackets and send; do not start from blank.

> **[Poker Ledger] 개인정보 유출 안내**
>
> 1. **유출된 개인정보의 항목:** [항목]
> 2. **유출 시점 및 경위:** [YYYY-MM-DD HH:MM]부터 [YYYY-MM-DD HH:MM]까지, [경위]
> 3. **이용자가 취할 수 있는 조치:** 브라우저에서 이 사이트의 사이트 데이터를 삭제하시고,
>    해당 기간 중 입력하신 정보가 있다면 확인하여 주시기 바랍니다.
> 4. **운영자의 대응 조치 및 피해 구제절차:** [조치], 문의: `[[CONTACT_EMAIL]]`
> 5. **담당 연락처:** `[[OPERATOR_NAME]]`, `[[CONTACT_EMAIL]]`

Because there is no user mailing list, notification is by **prominent notice on the site
itself for at least 7 days**, which Article 34 permits where individual contact is not
possible. Put it above the calculator, not in the footer.

---

## 2. Rollback and kill switch

The site is static files on a branch. That makes recovery unusually simple.

```sh
# See what is live and when it went live
git log --oneline -10

# Roll back one deploy
git revert HEAD && git push        # live in ~45s, measured on this repo

# Kill advertising without a rollback: empty the publisher ID
sh scripts/enable-adsense.sh ""
git commit -am "Disable advertising" && git push
```

**Full takedown:** GitHub → repo Settings → Pages → set Source to None. The site is gone
in under a minute. Do this if malicious code is live and you cannot immediately identify
what it did.

**Recovery of the site itself** is `git clone`. There is no database, so there is no
restore to rehearse beyond confirming the clone builds — which is `sh test/run.sh`.

---

## 3. Where things live

| Thing | Where | Recovery |
|---|---|---|
| Source and history | github.com/calvinkim85/poker-ledger | Any clone is a complete backup |
| Hosting | GitHub Pages, from `main` | Settings → Pages |
| Domain | `[[SITE_URL]]` at your registrar | Registrar account; keep the contact email current and separate from the domain itself |
| TLS | Let's Encrypt, auto-renewed by GitHub | Nothing to do; verify after any DNS change |
| Advertising | Google AdSense | adsense.google.com |
| Secrets | **There are none.** No API keys, no tokens, no env files. | — |

**The one real single point of failure is your GitHub account.** Everything else is
recoverable from a clone. Turn on 2FA and keep the recovery codes somewhere that is not
this laptop.

---

## 4. Launch order

Phases matter: you cannot get a publisher ID before approval, and you should not ship ad
code before you have one.

**Phase 1 — make it launchable**
1. Buy the domain.
2. `sh scripts/configure-launch.sh "Name" "privacy@domain" "domain.com"`
3. Read both privacy policies and the terms end to end. Correct anything untrue.
4. `sh scripts/preflight.sh` — must pass.
5. `sh test/run.sh` — must be green.
6. Point DNS at GitHub Pages; set the custom domain in repo settings; enable Enforce HTTPS.
7. Merge to `main` and push.

**Phase 2 — get indexed, then apply**
8. Submit the sitemap in Google Search Console and wait for pages to index. A site with
   no indexed pages reads as having no audience.
9. Apply to AdSense. Expect this to take days to weeks.
   - github.io subdomains face much steeper scrutiny than a real domain. This is the
     main reason the custom domain is step 1 and not step 10.
   - "Low value content" is the usual rejection for a single-page tool. The site now
     carries ~7,500 words across 11 pages, which is why those pages exist.
   - You must be 18+ to hold an AdSense account.

**Phase 3 — turn it on**
10. `sh scripts/enable-adsense.sh ca-pub-XXXXXXXXXXXXXXXX`
11. Paste the AdSense `ads.txt` line into `ads.txt`, replacing the comments.
12. Configure a consent message in AdSense → Privacy & messaging if you ever want EEA
    traffic. The first-party gate in `consent.js` covers Korea and the US.
13. Push. Confirm on a fresh browser profile that **no Google request is made before you
    click Allow** — that is the whole point of the gate, and it is the thing most likely
    to regress.

---

## 5. Known gaps, stated rather than hidden

- **Full CSP is not achievable here.** Google supports only strict CSP with per-request
  nonces for AdSense; a domain allowlist breaks ad serving as their domains rotate, and
  a static host cannot generate nonces. `frame-ancestors` and `X-Content-Type-Options`
  are header-only and GitHub Pages sets neither. Moving to Cloudflare Pages or Netlify
  would close all of this and is the single highest-value infrastructure change available.
- **No uptime monitoring.** For a static page on GitHub's CDN this is a low-value alert,
  but it means you will hear about an outage from a friend. UptimeRobot is free.
- **EU users are not covered.** The site is reachable from the EEA, where the European
  Accessibility Act makes WCAG 2.1 AA a legal requirement and GDPR applies in full.
  WCAG 2.1 AA is met on colour contrast and keyboard access; GDPR is not addressed at
  all. Either accept the exposure deliberately or do that work.
- **Nobody has reviewed the legal text.** See section 0.
