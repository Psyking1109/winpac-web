#!/usr/bin/env bash
# Mac / Linux: run the website and get a free public link for testing.
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Install Node.js LTS from https://nodejs.org, then run this again."; exit 1; fi
major=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$major" -lt 22 ]; then echo "Your Node.js is too old. Install the LTS version from https://nodejs.org"; exit 1; fi
[ -d node_modules ] || npm install --omit=dev --no-audit --no-fund
node server/setup.js
node server/index.js & SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 3
echo
echo "================================================================"
echo " Getting a free public link. Look below for a line like:"
echo "   https://something-random.trycloudflare.com"
echo " Share that link to let anyone test the site. Press Ctrl+C to stop."
echo "================================================================"
npx --yes cloudflared tunnel --url http://localhost:8080
