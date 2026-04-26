#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

echo "Syncing Notion blog data..."
node scripts/sync-blog.mjs

echo
echo "Updated content/blog.seed.json"
echo
git status --short content/blog.seed.json
