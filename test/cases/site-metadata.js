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
