#!/usr/bin/env bash
#
# Runs the real tuigram against the fake Telegram in demo/mtcute.js.
#
# Its own XDG directories under a temp dir and dummy API credentials, so your real config,
# session and log are never touched. Press Enter on the chat list to open the first chat.

set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)

sandbox=$(mktemp -d)
trap 'rm -rf "$sandbox"' EXIT
mkdir -p "$sandbox/config/tuigram"
cat > "$sandbox/config/tuigram/config.json" <<'JSON'
{ "theme": "aqua-lime", "imageProtocol": "kitty", "dialogEmoji": true }
JSON

# TUIGRAM_RELAUNCHED stops bin/tuigram.js re-execing itself, which would drop the --require
# preload; the FFI flag opentui needs is passed here instead.
XDG_CONFIG_HOME="$sandbox/config" \
XDG_DATA_HOME="$sandbox/data" \
XDG_STATE_HOME="$sandbox/state" \
TUIGRAM_LOG="$sandbox/tuigram.log" \
TUIGRAM_API_ID=1234567 \
TUIGRAM_API_HASH=0123456789abcdef0123456789abcdef \
TUIGRAM_RELAUNCHED=1 \
  node --experimental-ffi --require "$root/demo/mtcute.js" "$root/bin/tuigram.js"

[ -s "$sandbox/tuigram.log" ] && cat "$sandbox/tuigram.log"
