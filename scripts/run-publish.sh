#!/bin/bash
echo "Scan and publish Speedlify"
cd "$(dirname "$0")/.." || exit 1
git reset --hard
npm run measure
git add .