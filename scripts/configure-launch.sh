#!/bin/sh
# Fill in the three launch placeholders and point the site at its own domain.
#
#   sh scripts/configure-launch.sh "Your Legal Name" "privacy@yourdomain.com" "yourdomain.com"
#
# Touches: every .html page, sitemap.xml, robots.txt, CNAME.
# Idempotent in the sense that re-running with different values re-points everything,
# because it rewrites whatever host is currently in the canonical tags rather than
# assuming the original one.
set -eu

if [ $# -ne 3 ]; then
  echo "usage: sh scripts/configure-launch.sh \"Legal Name\" \"contact@domain\" \"domain.com\"" >&2
  exit 2
fi

NAME="$1"; EMAIL="$2"; DOMAIN="$3"
cd "$(dirname "$0")/.."

case "$DOMAIN" in
  http*|*/*) echo "error: give a bare hostname, e.g. pokerledger.app" >&2; exit 2 ;;
  *.*) ;;
  *) echo "error: '$DOMAIN' does not look like a domain" >&2; exit 2 ;;
esac
case "$EMAIL" in *@*.*) ;; *) echo "error: '$EMAIL' does not look like an email" >&2; exit 2 ;; esac

OLD_BASE="https://calvinkim85.github.io/poker-ledger/"
NEW_BASE="https://$DOMAIN/"

echo "  operator : $NAME"
echo "  contact  : $EMAIL"
echo "  site     : $NEW_BASE"
echo

python3 - "$NAME" "$EMAIL" "$NEW_BASE" "$OLD_BASE" <<'PY'
import sys, os, glob
name, email, new_base, old_base = sys.argv[1:5]

files = sorted(set(glob.glob("*.html") + glob.glob("guides/*.html") +
                   ["sitemap.xml", "robots.txt"]))
changed = 0
for f in files:
    if not os.path.exists(f):
        continue
    src = open(f, encoding="utf-8").read()
    out = src.replace(old_base, new_base)
    out = out.replace("[[OPERATOR_NAME]]", name)
    out = out.replace("[[CONTACT_EMAIL]]", email)
    out = out.replace("[[SITE_URL]]", new_base)
    # The placeholders were rendered as visible TODO chips; once filled they are
    # ordinary text, so drop the chip styling with them.
    out = out.replace('<span class="todo">%s</span>' % name, name)
    out = out.replace('<span class="todo">%s</span>' % email,
                      '<a href="mailto:%s">%s</a>' % (email, email))
    out = out.replace('<span class="todo">%s</span>' % new_base, new_base)
    # 404.html carries /poker-ledger/ roots so it works on a project page; on an
    # apex domain the site is at the root.
    if f == "404.html":
        out = out.replace('href="/poker-ledger/', 'href="/')
    if out != src:
        open(f, "w", encoding="utf-8").write(out)
        changed += 1
        print("  rewritten  %s" % f)
print("\n  %d files updated" % changed)
PY

printf '%s\n' "$DOMAIN" > CNAME
echo "  written    CNAME -> $DOMAIN"

echo
echo "Next:"
echo "  1. Read privacy.html, privacy-ko.html and terms.html end to end."
echo "     Remove the 'not yet in force' banners once you are satisfied they are true."
echo "  2. sh scripts/preflight.sh"
echo "  3. sh test/run.sh"
