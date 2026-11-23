#!/usr/bin/env bash
# Cynbit website crawl checker: status codes, broken internal links, dead in-page
# anchors, duplicate <title>s, canonical tags, and security headers.
# Read-only: sends GET/HEAD requests only, with a delay that respects robots.txt Crawl-delay.
#
# Usage:  ./scripts/crawl_check.sh [base_url]     (default https://www.cynbit.in)
set -euo pipefail

BASE="${1:-https://www.cynbit.in}"
DELAY="${DELAY:-1}"                       # robots.txt asks for Crawl-delay: 1
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
UA="cynbit-qa-audit/1.0 (+read-only link checker)"
fetch() { sleep "$DELAY"; curl -sS -A "$UA" "$@"; }

echo "== Sitemap =="
fetch "$BASE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed -E 's#</?loc>##g' \
  | sed -E "s#^https?://(www\.)?cynbit\.in#$BASE#" > "$WORK/urls.txt"
echo "URLs in sitemap: $(wc -l < "$WORK/urls.txt")"

echo; echo "== Status codes (non-200 only) =="
i=0
while read -r u; do
  i=$((i+1)); f="$WORK/page_$i.html"
  code=$(fetch -o "$f" -w '%{http_code}' "$u")
  echo "$u" > "$f.url"
  [ "$code" = 200 ] || echo "  $code $u"
done < "$WORK/urls.txt"

echo; echo "== Broken internal links =="
grep -ohE 'href="/[^"#?]*"' "$WORK"/page_*.html | sed -E 's/href="|"//g' \
  | grep -vE '^/_next|\.(png|jpe?g|svg|ico|webp|css|js|woff2?)$' | sort -u > "$WORK/links.txt"
while read -r p; do
  code=$(fetch -o /dev/null -w '%{http_code}' "$BASE$p")
  if [ "$code" != 200 ]; then
    src=$(grep -l "href=\"$p\"" "$WORK"/page_*.html | head -3 | xargs -I{} cat {}.url | tr '\n' ' ')
    echo "  $code $p   <- linked from: $src"
  fi
done < "$WORK/links.txt"

echo; echo "== Dead in-page anchors (href=\"#x\" with no id=\"x\") =="
total=0
for f in "$WORK"/page_*.html; do
  miss=0
  for a in $(grep -oE 'href="#[A-Za-z0-9_-]+"' "$f" | sort -u | sed -E 's/href="#|"//g'); do
    grep -q "id=\"$a\"" "$f" || miss=$((miss+1))
  done
  [ $miss -gt 0 ] && { echo "  $miss  $(cat "$f.url")"; total=$((total+miss)); }
done
echo "  TOTAL dead anchors: $total"
echo "  (note: server-rendered HTML only; confirm in a browser if ids are added client-side)"

echo; echo "== Duplicate <title>s =="
for f in "$WORK"/page_*.html; do
  printf '%s\t%s\n' "$(grep -o '<title>[^<]*' "$f" | sed 's/<title>//')" "$(cat "$f.url")"
done | sort > "$WORK/titles.tsv"
cut -f1 "$WORK/titles.tsv" | uniq -c | awk '$1>1' | sort -nr

echo; echo "== Pages without rel=canonical =="
n=0; for f in "$WORK"/page_*.html; do grep -q 'rel="canonical"' "$f" || n=$((n+1)); done
echo "  $n of $(ls "$WORK"/page_*.html | wc -l)"

echo; echo "== Security headers on $BASE/ =="
h=$(fetch -I "$BASE/")
for k in strict-transport-security content-security-policy x-frame-options \
         x-content-type-options referrer-policy permissions-policy access-control-allow-origin; do
  v=$(echo "$h" | grep -i "^$k:" | cut -d' ' -f2- | tr -d '\r')
  printf '  %-28s %s\n' "$k" "${v:-MISSING}"
done

echo; echo "== Apex redirect =="
fetch -o /dev/null -w '  %{http_code} -> %{redirect_url}\n' "https://cynbit.in/"
