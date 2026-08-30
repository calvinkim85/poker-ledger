#!/bin/sh
# Regenerate the project zip.
#
# Built from HEAD with `git archive`, not from the working tree, and that is deliberate:
# it means the zip always contains exactly what is on GitHub. If the two could differ,
# the zip would be worse than useless — it would be a confident-looking lie about what
# is deployed.
#
# Runs automatically after every commit and every pull (see .githooks/). Run by hand
# any time with: sh tools/make-zip.sh
set -e
cd "$(git rev-parse --show-toplevel)"

OUT="poker-ledger-project.zip"
git archive --format=zip --prefix=poker-ledger/ -o "$OUT" HEAD

SIZE=$(du -h "$OUT" | cut -f1)
COUNT=$(unzip -Z1 "$OUT" | grep -vc '/$' || true)
SHA=$(git rev-parse --short HEAD)
echo "  ${OUT}: ${COUNT} files, ${SIZE}, matching commit ${SHA}"
