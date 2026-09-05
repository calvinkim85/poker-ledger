// needs: site

/* The canonical link, the Open Graph URL and image, the manifest scope and the sitemap
   all have to name the same site. Getting them out of step is the classic way a domain
   migration half-lands: everything still renders, and nothing complains until Search
   Console reports duplicate content weeks later. */

log("-- one site URL, agreed everywhere --");
var canonical = head.match(/<link rel="canonical" href="([^"]+)"/);
eq("index.html declares a canonical URL", !!canonical, true);
var SITE = canonical ? canonical[1] : "";
eq("canonical ends in a slash", /\/$/.test(SITE), true);
eq("canonical is https", /^https:\/\//.test(SITE), true);

eq("og:url matches canonical",
   (head.match(/<meta property="og:url" content="([^"]+)"/) || [])[1], SITE);
eq("og:image sits under the site",
   (head.match(/<meta property="og:image" content="([^"]+)"/) || [])[1], SITE + "og.png");
eq("twitter:image matches og:image",
   (head.match(/<meta name="twitter:image" content="([^"]+)"/) || [])[1], SITE + "og.png");
eq("sitemap lists the canonical URL", sitemap.indexOf("<loc>" + SITE + "</loc>") !== -1, true);
eq("every sitemap URL sits under the canonical site",
   (sitemap.match(/<loc>([^<]+)<\/loc>/g) || []).filter(function(l){
     return l.indexOf("<loc>" + SITE) !== 0;
   }), []);
eq("robots.txt points at the sitemap",
   robots.indexOf("Sitemap: " + SITE + "sitemap.xml") !== -1, true);

log("-- the card social scrapers will render --");
eq("og:image dimensions declared 1200x630",
   [(head.match(/<meta property="og:image:width" content="([^"]+)"/) || [])[1],
    (head.match(/<meta property="og:image:height" content="([^"]+)"/) || [])[1]],
   ["1200", "630"]);
eq("summary_large_image card",
   (head.match(/<meta name="twitter:card" content="([^"]+)"/) || [])[1], "summary_large_image");
eq("og:image has alt text",
   /<meta property="og:image:alt" content="[^"]{10,}"/.test(head), true);
eq("a meta description exists",
   /<meta name="description" content="[^"]{30,}"/.test(head), true);

log("-- the guide Google and AdSense both need --");
eq("guide is present", html.indexOf('<details class="guide"') !== -1, true);
eq("guide is collapsed by default (no open attribute)",
   /<details class="guide" id="guide"(?![^>]*\bopen\b)/.test(html), true);
eq("guide uses real headings", (html.match(/<h2>/g) || []).length >= 5, true);
eq("guide is substantial enough to be worth indexing", guideWords > 800, true);

log("-- no advertising is loaded --");
eq("no AdSense script", html.indexOf("googlesyndication") === -1, true);
eq("ad slot still hidden", /<aside class="adslot" id="adslot" hidden/.test(html), true);
/* ads.txt is comments-only until AdSense approves. Once it carries a line, that
   line has to name the same publisher as consent.js — a mismatch here is the classic
   way a site serves ads that earn nothing, and nothing else would notice. */
var adsLines = ads.split("\n").filter(function(l){
  return l.trim() && l.trim().charAt(0) !== "#";
});
var pub = (typeof consentJs === "string" ? consentJs : "").match(/var CLIENT = "ca-pub-(\d{16})";/);
if (!pub) {
  eq("ads.txt is comments only while advertising is off", adsLines.length, 0);
} else {
  eq("ads.txt carries exactly one publisher line", adsLines.length, 1);
  eq("ads.txt names the same publisher as consent.js",
     adsLines[0].indexOf("pub-" + pub[1]) !== -1, true);
  eq("ads.txt declares a DIRECT relationship", /DIRECT/.test(adsLines[0]), true);
}

log("-- the title and description are doing search work, not just naming the app --");
var title = (head.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
var desc  = (head.match(/<meta name="description" content="([^"]+)"/) || [])[1] || "";
eq("the title carries the product name", /Home Poker Ledger/.test(title), true);
eq("the title fits a search result without truncating (<= 60 chars)", title.length <= 60, true);
eq("the title says what the thing does, not only what it is called",
   /calculator|payout|buy-in|settle/i.test(title.replace("Home Poker Ledger", "")), true);
eq("the description is long enough to be used and short enough to survive",
   desc.length >= 110 && desc.length <= 165, true);
eq("the description names the core action", /who pays whom/i.test(desc), true);
eq("the description says it is free", /free/i.test(desc), true);

log("-- structured data --");
var ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
eq("index.html carries JSON-LD", !!ld, true);
var parsed = null;
try { parsed = JSON.parse(ld[1]); } catch (e) { parsed = null; }
eq("the JSON-LD parses", !!parsed, true);
eq("it declares a WebApplication", parsed && parsed["@type"], "WebApplication");
eq("it declares the app free", parsed && parsed.offers && parsed.offers.price, "0");
eq("the structured-data name matches the page", parsed && parsed.name, "Home Poker Ledger");
eq("the structured-data URL matches the canonical", parsed && parsed.url, SITE);

log("-- the home-screen label will not truncate --");
var mani = null;
try { mani = JSON.parse(manifest); } catch (e) {}
eq("manifest parses", !!mani, true);
eq("short_name is short enough for an icon label",
   mani && mani.short_name.length <= 12, true);
eq("the full name is the product name", mani && mani.name, "Home Poker Ledger");
