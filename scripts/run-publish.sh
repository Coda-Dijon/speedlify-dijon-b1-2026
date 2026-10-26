#!/bin/bash
echo "Scan and publish Speedlify"
cd "$(dirname "$0")/.." || exit 1
git reset --hard
npm run test-pages
git add .
git commit -m "Automatic Scan and publish $(date)"
git push --force