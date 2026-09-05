#!/usr/bin/env python3
"""Assemble runnable test suites out of index.html.

There is no build step for the app and no node on this machine, so the tests pull the
pure functions straight out of the single HTML file and run them under macOS's built-in
JavaScriptCore. Extracting rather than duplicating is the point: a suite can never drift
from the code it is testing.

Each file in test/cases/ starts with a `// needs: <prelude>` line naming what it wants:

  core     the money layer, the settlement algorithm, and the gap-splitting rule
  storage  the above plus load(), systemTheme(), and stubs for localStorage/matchMedia
  site     the raw text of index.html and the crawler files, for asserting on markup
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
CASES = os.path.join(ROOT, "test", "cases")
BUILD = os.path.join(ROOT, "test", "build")


def script_body():
    html = open(SRC, encoding="utf-8").read()
    m = re.search(r"<script>\n(.*?)\n</script>", html, re.S)
    if not m:
        sys.exit("could not find the <script> block in index.html")
    return m.group(1)


def region(js, start, end):
    """Everything from the line containing `start` up to the next `end`."""
    i = js.index(start)
    return js[i:js.index(end, i)]


def func(js, decl):
    """A single top-level function, matched by its two-space indented closing brace."""
    i = js.index(decl)
    return js[i:js.index("\n  }\n", i) + 5]


HARNESS = '''var out = [];
function log(){ out.push(Array.prototype.join.call(arguments, " ")); }
var pass = 0, fail = 0;
function eq(label, got, want){
  var a = JSON.stringify(got), b = JSON.stringify(want);
  if(a === b){ pass++; log("  ok   " + label); }
  else { fail++; log("  FAIL " + label + "\\n        got  " + a + "\\n        want " + b); }
}
'''

STUBS = '''
/* --- stubs standing in for the browser --- */
var OS_DARK = true;
var window = { matchMedia: function(){ return { matches: OS_DARK }; } };
var store = {};
var localStorage = {
  getItem: function(k){ return store[k] || null; },
  setItem: function(k, v){ store[k] = v; }
};
'''


def build():
    js = script_body()
    core = "\n".join([
        region(js, "var CURRENCIES = {", "var CURRENCY_ORDER"),
        region(js, "var CURRENCY_ORDER", "\n\n"),
        'var state = { players:[], defaultBuyIn:2000, currency:"USD", absorb:false };\n',
        region(js, "  function cur(){", "  /* ---------- persistence"),
        region(js, "  function totalIn(p){", "  /* ---------- rendering"),
    ])
    storage = "\n".join([
        core,
        'var KEY = "poker.ledger.v1";',
        "var MIN_PLAYERS = 2, MAX_PLAYERS = 9;",
        region(js, "  var THEMES = [", "  var root ="),
        "var themeState = null;",
        STUBS,
        func(js, "  function load(){"),
    ])
    def js_string(text):
        return "\"" + text.replace("\\", "\\\\").replace('"', '\\"') \
                          .replace("\n", "\\n").replace("\r", "") + "\""

    def read(name):
        path = os.path.join(ROOT, name)
        return open(path, encoding="utf-8").read() if os.path.exists(path) else ""

    html = open(SRC, encoding="utf-8").read()
    guide = re.search(r"<details class=\"guide\".*?</details>", html, re.S)
    guide_words = len(re.sub(r"<[^>]+>", " ", guide.group(0)).split()) if guide else 0
    pages = ["privacy.html", "privacy-ko.html", "terms.html", "404.html",
             "how-it-works.html", "guides/index.html",
             "guides/chip-denominations.html", "guides/rebuys-and-late-entries.html",
             "guides/being-the-banker.html", "guides/settlement-mistakes.html"]
    site = HARNESS + "\n".join([
        "var html = %s;" % js_string(html),
        "var head = %s;" % js_string(html[:html.find("</head>")]),
        "var sitemap = %s;" % js_string(read("sitemap.xml")),
        "var robots = %s;" % js_string(read("robots.txt")),
        "var ads = %s;" % js_string(read("ads.txt")),
        "var css = %s;" % js_string(read("site.css")),
        "var consentJs = %s;" % js_string(read("consent.js")),
        "var guideWords = %d;" % guide_words,
        "/* pages */",
        "var pages = {%s};" % ", ".join(
            "%s: %s" % (js_string(n), js_string(read(n))) for n in pages),
    ])

    preludes = {"core": HARNESS + core, "storage": HARNESS + storage, "site": site}

    os.makedirs(BUILD, exist_ok=True)
    built = []
    for name in sorted(os.listdir(CASES)):
        if not name.endswith(".js"):
            continue
        body = open(os.path.join(CASES, name), encoding="utf-8").read()
        m = re.match(r"//\s*needs:\s*(\w+)", body)
        if not m:
            sys.exit("%s is missing its `// needs:` line" % name)
        kind = m.group(1)
        if kind not in preludes:
            sys.exit("%s asks for unknown prelude %r" % (name, kind))
        outp = os.path.join(BUILD, name)
        tail = ('\nlog(""); log("PASS " + pass + "   FAIL " + fail);\n'
                'var __f = $.NSString.alloc.initWithUTF8String(out.join("\\n"));\n'
                '__f.writeToFileAtomicallyEncodingError(%r, true, $.NSUTF8StringEncoding, $());\n'
                '"done";\n' % (outp[:-3] + ".txt"))
        open(outp, "w", encoding="utf-8").write(preludes[kind] + "\n" + body + tail)
        built.append(name)
    print("built %d suites: %s" % (len(built), ", ".join(built)))


if __name__ == "__main__":
    build()
