#!/usr/bin/env bash
# Builds the site and pushes it to the gh-pages branch, which GitHub Pages serves
# (Settings > Pages > Deploy from a branch > gh-pages, / root).
set -euo pipefail
cd "$(dirname "$0")/.."
npm run typecheck
npm run build
touch dist/.nojekyll   # serve files as they are, no Jekyll processing
rev=$(git rev-parse --short HEAD)
tmp=$(mktemp -d)
cp -r dist/. "$tmp"
cd "$tmp"
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-Runway Zero}" -c user.email="${GIT_AUTHOR_EMAIL:-noreply@example.com}" commit -q -m "Publish site from main $rev"
git push -f "$(cd - >/dev/null && git remote get-url origin)" gh-pages
rm -rf "$tmp"
echo "Published $rev to gh-pages"
