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
  eq(n + " links site.css", /<link rel="stylesheet" href="(\.\.\/)?(\/poker-ledger\/)?site\.css">/.test(p), true);
  eq(n + " declares a title", /<title>[^<]{10,}<\/title>/.test(p), true);
  eq(n + " declares a meta description", /<meta name="description" content="[^"]{40,}"/.test(p), true);
  eq(n + " sets a referrer policy", /<meta name="referrer" content="strict-origin-when-cross-origin">/.test(p), true);
  eq(n + " sets the enforceable CSP directives",
     /<meta http-equiv="Content-Security-Policy" content="object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests">/.test(p), true);
  eq(n + " does not allowlist ad domains, which would break serving over time",
     p.indexOf("script-src") === -1, true);
});

eq("the app carries the same headers as the document pages",
   /<meta name="referrer" content="strict-origin-when-cross-origin">/.test(html) &&
   /Content-Security-Policy/.test(html), true);

log("-- every indexable page is canonical and reachable --");
NAMES.filter(function(n){ return n !== "404.html"; }).forEach(function(n){
  var p = pages[n];
  eq(n + " declares a canonical URL", /<link rel="canonical" href="https:\/\/[^"]+">/.test(p), true);
  eq(n + " is listed in the sitemap",
     sitemap.indexOf(p.match(/<link rel="canonical" href="([^"]+)"/)[1]) !== -1, true);
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

log("-- placeholders are consistent, and only where they belong --");
var TOKENS = ["[[OPERATOR_NAME]]", "[[CONTACT_EMAIL]]", "[[SITE_URL]]"];
["privacy.html", "privacy-ko.html"].forEach(function(n){
  TOKENS.forEach(function(t){
    eq(n + " still carries " + t, pages[n].indexOf(t) !== -1, true);
  });
});
eq("the app itself carries no placeholder",
   TOKENS.filter(function(t){ return html.indexOf(t) !== -1; }), []);
eq("every placeholder is visibly flagged rather than silent",
   /<span class="todo">\[\[OPERATOR_NAME\]\]<\/span>/.test(pages["privacy.html"]), true);

log("-- there is enough original content to be worth indexing --");
function words(p){ return p.replace(/<script[\s\S]*?<\/script>/g, " ")
                           .replace(/<[^>]+>/g, " ").split(/\s+/).length; }
["how-it-works.html", "guides/chip-denominations.html", "guides/rebuys-and-late-entries.html",
 "guides/being-the-banker.html", "guides/settlement-mistakes.html"].forEach(function(n){
  eq(n + " carries a substantial article", words(pages[n]) > 450, true);
});
var total = NAMES.reduce(function(a, n){ return a + words(pages[n]); }, 0) + guideWords;
log("   total indexable prose: ~" + total + " words");
eq("the site as a whole is not a one-page thin site", total > 3000, true);
