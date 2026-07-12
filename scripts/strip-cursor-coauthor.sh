#!/bin/bash
# Remove Cursor co-author from the latest commit and force-push (hackathon repos only).
set -euo pipefail
cd "$(dirname "$0")/.."

MSG=$(git log -1 --format='%B' | sed '/^Co-authored-by: Cursor <cursoragent@cursor.com>$/d')
TREE=$(git rev-parse 'HEAD^{tree}')
PARENT=$(git rev-parse 'HEAD^' 2>/dev/null || true)

if [ -n "$PARENT" ]; then
  NEW=$(printf '%s' "$MSG" | git commit-tree "$TREE" -p "$PARENT")
else
  NEW=$(printf '%s' "$MSG" | git commit-tree "$TREE")
fi

git update-ref refs/heads/main "$NEW"
echo "Rewrote commit without Cursor co-author: $NEW"
git log -1 --format='%B'
echo ""
read -r -p "Force-push to origin/main? [y/N] " ans
if [ "$ans" = "y" ] || [ "$ans" = "Y" ]; then
  git push --force-with-lease origin main
  echo "Done. cursoragent should drop off contributors after GitHub refreshes (can take a few minutes)."
fi
