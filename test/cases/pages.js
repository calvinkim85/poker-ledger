// needs: site

/* The document pages carry the obligations the app itself cannot: the privacy policy
   AdSense and PIPA both require, the Korean version PIPA Art. 30 requires in Korean,
   the terms, and a 404 that keeps a lost visitor inside the site.

   These pages are hand-written HTML with no build step, so nothing else would notice
   if one lost its canonical tag or stopped linking the stylesheet. */

var NAMES = Object.keys(pages);

log("-- every page exists and is wired to the shared stylesheet --");
NAMES.forEach(function(n){
  var p = pages[n];
  eq(n + " is present and non-trivial", p.length > 1500, true);
  eq(n + " links site.css", /<link rel="stylesheet" href="(\.\.\/|\/poker-ledger\/|\/)?site\.css">/.test(p), true);
  eq(n + " declares a title", /<title>[^<]{10,}<\/title>/.test(p), true);
  eq(n + " declares a meta description", /<meta name="description" content="[^"]{40,}"/.test(p), true);
  eq(n + " sets a referrer policy", /<meta name="referrer" content="strict-origin-when-cross-origin">/.test(p), true);
  eq(n + " sets the enforceable CSP directives",
     /<meta http-equiv="Content-Security-Policy" content="object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests">/.test(p), true);
  /* The rule is about the policy, not the file: the HTML comment above it explains
     why script-src is absent and legitimately contains the string. */
  eq(n + " does not allowlist ad domains, which would break serving over time",
     /content="[^"]*script-src/.test(p), false);
});

eq("the app carries the same headers as the document pages",
   /<meta name="referrer" content="strict-origin-when-cross-origin">/.test(html) &&
   /Content-Security-Policy/.test(html), true);

log("-- every indexable page is canonical and reachable --");
NAMES.filter(function(n){ return n !== "404.html"; }).forEach(function(n){
  var p = pages[n];
  eq(n + " declares a canonical URL", /<link rel="canonical" href="https:\/\/[^"]+">/.test(p), true);
  /* Read the match before indexing it. A page with no canonical tag used to throw here,
     which aborted the whole suite rather than failing one assertion — and an aborted
     suite is far harder to notice than a red line. */
  var canon = p.match(/<link rel="canonical" href="([^"]+)"/);
  eq(n + " is listed in the sitemap",
     !!canon && sitemap.indexOf(canon[1]) !== -1, true);
});
eq("404.html is excluded from the index", /<meta name="robots" content="noindex">/.test(pages["404.html"]), true);
eq("404.html is not in the sitemap", sitemap.indexOf("404.html") === -1, true);

log("-- the footer reaches the legal pages from everywhere --");
NAMES.concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  eq(label + " links the privacy policy", /href="[^"]*privacy\.html"/.test(p), true);
  eq(label + " links the Korean policy", /href="[^"]*privacy-ko\.html"/.test(p), true);
  eq(label + " links the terms", /href="[^"]*terms\.html"/.test(p), true);
});

log("-- the privacy policy names every third party that receives a request --");
var priv = pages["privacy.html"];
["GitHub", "Google Fonts", "AdSense"].forEach(function(party){
  eq("privacy.html names " + party, priv.indexOf(party) !== -1, true);
});
eq("privacy.html says where the data goes", /United States/.test(priv), true);
eq("privacy.html explains how to refuse advertising cookies",
   priv.indexOf("optout.aboutads.info") !== -1 && priv.indexOf("myadcenter.google.com") !== -1, true);
eq("privacy.html covers children", /under 14|under 13/.test(priv), true);

log("-- the Korean policy meets PIPA Art. 30's required elements --");
var ko = pages["privacy-ko.html"];
eq("privacy-ko.html is served as Korean", /<html lang="ko">/.test(ko), true);
[["처리 목적", "purpose"], ["항목", "categories"], ["보유 기간", "retention"],
 ["제3자 제공", "third-party provision"], ["국외 이전", "cross-border transfer"],
 ["정보주체의 권리", "data-subject rights"], ["개인정보 보호책임자", "privacy officer"],
 ["거부", "how to refuse automatic collection"]].forEach(function(pair){
  eq("privacy-ko.html covers " + pair[1] + " (" + pair[0] + ")", ko.indexOf(pair[0]) !== -1, true);
});
eq("the two policies point at each other",
   priv.indexOf("privacy-ko.html") !== -1 && ko.indexOf("privacy.html") !== -1, true);

log("-- placeholders are all-or-nothing --");
/* Before launch these are unfilled; scripts/configure-launch.sh fills them and they
   are gone for good. Asserting they are present would make this suite fail the moment
   the site actually launches. What must always hold is that they are never HALF
   filled — a privacy policy naming a contact but not an officer, or vice versa, is
   worse than one that is obviously still a draft. */
var TOKENS = ["[[OPERATOR_NAME]]", "[[OPERATOR_NAME_KO]]", "[[CONTACT_EMAIL]]", "[[SITE_URL]]"];
var LEGAL = ["privacy.html", "privacy-ko.html", "terms.html"];
var present = [], absent = [];
LEGAL.forEach(function(n){
  TOKENS.forEach(function(t){
    /* terms.html does not carry [[SITE_URL]]; only count tokens a page uses at all. */
    if (n === "terms.html" && (t === "[[SITE_URL]]" || t === "[[OPERATOR_NAME_KO]]")) return;
    if (n === "privacy.html" && t === "[[OPERATOR_NAME_KO]]") return;
    if (n === "privacy-ko.html" && t === "[[OPERATOR_NAME]]") return;
    (pages[n].indexOf(t) !== -1 ? present : absent).push(n + " " + t);
  });
});
eq("placeholders are either all unfilled or all filled, never a mix",
   present.length === 0 || absent.length === 0, true);

if (present.length) {
  log("   (pre-launch: " + present.length + " placeholders still to fill)");
  eq("an unfilled placeholder is visibly flagged, not silent",
     /<span class="todo">\[\[OPERATOR_NAME\]\]<\/span>/.test(pages["privacy.html"]), true);
  eq("an unfilled policy says so in a banner",
     pages["privacy.html"].indexOf("Not yet in force") !== -1 &&
     pages["privacy-ko.html"].indexOf("아직 시행 전입니다") !== -1, true);
} else {
  log("   (configured: placeholders filled in)");
  eq("a filled-in contact is a working mailto link",
     /<a href="mailto:[^"]+@[^"]+">/.test(pages["privacy.html"]), true);
  /* Removing the draft banner is a human step — it means someone read the policy and
     stands behind it. configure-launch.sh deliberately does not do it, so the suite
     does not assert it either; scripts/preflight.sh blocks launch while it is there. */
}

eq("the app itself never carries a placeholder",
   TOKENS.filter(function(t){ return html.indexOf(t) !== -1; }), []);

log("-- there is enough original content to be worth indexing --");
function words(p){ return p.replace(/<script[\s\S]*?<\/script>/g, " ")
                           .replace(/<[^>]+>/g, " ").split(/\s+/).length; }
/* Derived, never hand-listed. build.py globs guides/, so a new guide enrols itself
   here the moment it exists. The previous hand-typed list had gone stale: three
   guides were added to the site and to build.py but not to this assertion, so
   nothing checked they were more than a stub. guides/index.html is a directory
   listing rather than an article, so it is the one page held out. */
["how-it-works.html"].concat(NAMES.filter(function(n){
  return n.indexOf("guides/") === 0 && n !== "guides/index.html";
})).forEach(function(n){
  eq(n + " carries a substantial article", words(pages[n]) > 450, true);
});
log("-- every guide carries valid Article markup --");
/* Derived from NAMES for the same reason the length check is: a guide added to the
   site must not be able to ship without schema just because nobody edited a list.
   The ItemList on guides/index.html is the drift risk here — it names every guide,
   so adding one silently makes the index's own markup wrong. */
function ld(p){
  var m = p.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return "unparseable"; }
}
var ARTICLES = NAMES.filter(function(n){
  return n.indexOf("guides/") === 0 && n !== "guides/index.html";
});
ARTICLES.forEach(function(n){
  var o = ld(pages[n]);
  eq(n + " has parseable JSON-LD", o !== null && o !== "unparseable", true);
  if (!o || o === "unparseable") return;
  eq(n + " is typed Article", o["@type"], "Article");
  ["headline", "image", "datePublished", "dateModified", "author", "publisher",
   "mainEntityOfPage"].forEach(function(k){
    eq(n + " Article declares " + k, o[k] !== undefined && o[k] !== "", true);
  });
  /* Google truncates past 110 characters. */
  eq(n + " headline is within 110 characters", o.headline.length <= 110, true);
  eq(n + " dates are ISO yyyy-mm-dd",
     /^\d{4}-\d{2}-\d{2}$/.test(o.datePublished) && /^\d{4}-\d{2}-\d{2}$/.test(o.dateModified), true);
  eq(n + " was not modified before it was published", o.dateModified >= o.datePublished, true);
  /* Schema that points somewhere other than the page's own canonical is worse than none. */
  var canon = pages[n].match(/<link rel="canonical" href="([^"]+)"/);
  eq(n + " schema URL matches its canonical",
     !!canon && o.mainEntityOfPage["@id"] === canon[1] && o.url === canon[1], true);
});
var idx = ld(pages["guides/index.html"]);
eq("guides/index.html is typed CollectionPage", idx && idx["@type"], "CollectionPage");
eq("the index ItemList counts every guide and no others",
   idx && idx.mainEntity.numberOfItems === ARTICLES.length &&
   idx.mainEntity.itemListElement.length === ARTICLES.length, true);
eq("every guide appears in the index ItemList",
   ARTICLES.filter(function(n){
     var c = pages[n].match(/<link rel="canonical" href="([^"]+)"/)[1];
     return !idx.mainEntity.itemListElement.some(function(it){ return it.url === c; });
   }), []);

var total = NAMES.reduce(function(a, n){ return a + words(pages[n]); }, 0) + guideWords;
log("   total indexable prose: ~" + total + " words");
eq("the site as a whole is not a one-page thin site", total > 3000, true);

log("-- no half-removed editorial scaffolding --");
/* A draft banner was once stripped with a non-greedy regex that stopped at the first
   </div> — the inner heading. The wrapper vanished, the paragraph stayed, and a stray
   </div> was left behind. It shipped, because the check looked for the heading text
   (gone) and not the body text (still there). Both are asserted now, and so is the
   tag balance that would have caught the orphan. */
var DRAFT = ["This document is a draft", "not yet in force", "Not yet in force",
             "still placeholders", "reviewed by a lawyer", "이 문서는 초안입니다",
             "아직 시행 전입니다", "자리표시자", "lorem ipsum", "TODO", "FIXME"];
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  var found = DRAFT.filter(function(d){ return p.indexOf(d) !== -1; });
  eq(label + " carries no draft or placeholder language", found, []);
  /* Cheap structural check that catches an orphaned closing tag. */
  var open = (p.match(/<div\b/g) || []).length;
  var close = (p.match(/<\/div>/g) || []).length;
  eq(label + " has balanced <div> tags (" + open + "/" + close + ")", open, close);
});

log("-- the two privacy links read as one document in two languages --");
/* "Privacy · 개인정보처리방침 · Terms" listed three items when there are two: the middle
   one is the same policy translated. A reader asked whether they were the same thing,
   which is the bug. The Korean link is now paired to the English one rather than
   listed as a sibling, and carries lang/hreflang so a screen reader switches voice
   instead of reading Hangul with English phonetics. */
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  eq(label + " does not list the Korean policy as a third sibling",
     /<a href="[^"]*privacy\.html"[^>]*>Privacy<\/a><span class="sep">(&middot;|·)<\/span><a href="[^"]*privacy-ko\.html"/.test(p), false);
  eq(label + " pairs the Korean policy to the English one",
     /<a href="[^"]*privacy\.html" hreflang="en">Privacy<\/a>&#8202;<a href="[^"]*privacy-ko\.html"/.test(p), true);
  eq(label + " tags the Korean link as Korean for assistive tech",
     /<a href="[^"]*privacy-ko\.html" lang="ko" hreflang="ko"/.test(p), true);
  eq(label + " always shows English first, whatever the browser prefers",
     /">Privacy<\/a>/.test(p), true);
  eq(label + " carries no runtime hook for swapping the two",
     /data-policy/.test(p), false);
  eq(label + " gives the Korean link an explanatory accessible name",
     /aria-label="개인정보처리방침 — the privacy policy in Korean"/.test(p), true);
});

log("-- the operator's GitHub username is not exposed anywhere --");
/* The site is hosted on GitHub Pages, which the privacy policy must disclose — that
   is a real recipient of visitor IP addresses. But the HOST does not have to be named
   with a personal account handle, and the author would rather not be findable from
   the site. So: "GitHub Pages" stays, github.com/<username>/... does not. */
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  eq(label + " does not name the operator's GitHub account",
     /calvinkim85/.test(p), false);
  eq(label + " links no personal repository",
     /github\.com\/[A-Za-z0-9-]+\/poker-ledger/.test(p), false);
});
eq("the privacy policy still discloses GitHub Pages as the host, which it must",
   /GitHub Pages/.test(pages["privacy.html"]), true);
eq("the Korean policy does too",
   /GitHub/.test(pages["privacy-ko.html"]), true);

log("-- the published contact is the domain's own address --");
/* The site briefly published a personal Gmail. That address was disabled by its
   provider, which left a legal page pointing at a mailbox that bounced — and PIPA
   requires the contact to be reachable. The published address is now the domain's
   own, so where mail actually lands is a private forwarding detail that can change
   without touching the site, and no personal inbox is exposed. */
["privacy.html", "privacy-ko.html", "terms.html"].forEach(function(n){
  eq(n + " publishes the domain contact address",
     /mailto:service@homepokerledger\.com/.test(pages[n]), true);
});
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  eq(label + " exposes no personal mailbox",
     /gmail\.com|naver\.com|daum\.net|hanmail\.net|outlook\.com/i.test(p), false);
});

log("-- headings describe the page rather than label the nav --");
/* The H1 is the strongest on-page signal after <title>, and these were navigation
   labels: "Guides", "The banker", "Rebuys". They told a search engine nothing about
   what the page covers. Each is now a description, with the subtitle carrying the
   detail so the header still reads as a header. */
var HEADINGS = {
  "how-it-works.html":                   "settlement",
  "guides/index.html":                   "poker",
  "guides/chip-denominations.html":      "chip",
  "guides/rebuys-and-late-entries.html": "rebuy",
  "guides/being-the-banker.html":        "banker",
  "guides/settlement-mistakes.html":     "settlement"
};
Object.keys(HEADINGS).forEach(function(n){
  var h1 = (pages[n].match(/<h1>([^<]+)<\/h1>/) || [])[1] || "";
  eq(n + " has exactly one h1", (pages[n].match(/<h1>/g) || []).length, 1);
  eq(n + " h1 describes rather than labels (" + JSON.stringify(h1) + ")",
     h1.split(/\s+/).length >= 3, true);
  eq(n + " h1 carries its subject word '" + HEADINGS[n] + "'",
     new RegExp(HEADINGS[n], "i").test(h1), true);
  eq(n + " h1 mentions poker where the page is about poker",
     /poker/i.test(h1) || n === "how-it-works.html", true);
});
eq("the home page h1 is the product name, which is correct for a home page",
   (html.match(/<h1>([^<]+)<\/h1>/) || [])[1], "Home Poker Ledger");

log("-- no page requests a path from the old project-page URL --");
/* The site moved from /poker-ledger/ to an apex domain. configure-launch.sh rewrote
   href="/poker-ledger/..." but not src="...", so 404.html was left loading consent.js
   from a path that 404s — on the one page a lost visitor actually sees. */
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  eq(label + " has no leftover /poker-ledger/ path",
     /(?:href|src)="\/poker-ledger\//.test(p), false);
});
eq("404.html still loads the consent gate, from the right place",
   /<script src="\/consent\.js" defer><\/script>/.test(pages["404.html"]), true);

log("-- every title fits a search result without truncating --");
/* Google shows roughly 60 characters. A truncated title loses its ending, which is
   where the distinguishing keywords sit. Five pages were over after the new guides
   went in, the worst at 66. The brand suffix is kept only where it fits — Google
   appends the site name itself in many results anyway. */
Object.keys(pages).concat(["__app__"]).forEach(function(n){
  var p = n === "__app__" ? html : pages[n];
  var label = n === "__app__" ? "index.html" : n;
  var t = (p.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
  eq(label + " has a title", t.length > 10, true);
  eq(label + " title is <= 60 chars (" + t.length + ")", t.length <= 60, true);
});

log("-- and every description is a usable length --");
Object.keys(pages).forEach(function(n){
  var d = (pages[n].match(/<meta name="description" content="([^"]+)"/) || [])[1] || "";
  eq(n + " description is 80-165 chars (" + d.length + ")",
     d.length >= 80 && d.length <= 165, true);
});
