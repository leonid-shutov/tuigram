'use strict';

// Writes the app key every installed copy ships with into app-key.json at the package root, from the
// TUIGRAM_SHIPPED_API_ID / TUIGRAM_SHIPPED_API_HASH secrets. Runs in the publish workflow right
// before `npm publish`, so the key reaches the npm tarball (and every channel built from it) but
// never git. Each half is stored base64-encoded and split into fragments: not secrecy — anyone
// can unpack the tarball — only enough that a scraper grepping for a 32-hex hash walks past it.

const path = require('path');
const { writeFileSync } = require('fs');

const FRAGMENT = 9;
// Telegram api_ids are positive integers; mirrors API_ID in src/01-config/02-credentials.js.
const API_ID = /^[1-9]\d*$/u;
const TARGET = path.resolve(__dirname, '..', 'app-key.json');

const id = process.env.TUIGRAM_SHIPPED_API_ID?.trim() ?? '';
const hash = process.env.TUIGRAM_SHIPPED_API_HASH?.trim() ?? '';

if (!API_ID.test(id) || hash === '') {
  process.stderr.write('write-app-key: TUIGRAM_SHIPPED_API_ID and TUIGRAM_SHIPPED_API_HASH must both be set\n');
  process.exit(1);
}

const fragments = (value) => {
  const encoded = Buffer.from(value, 'utf8').toString('base64');
  const parts = [];
  for (let i = 0; i < encoded.length; i += FRAGMENT) parts.push(encoded.slice(i, i + FRAGMENT));
  return parts;
};

const json = JSON.stringify({ id: fragments(id), hash: fragments(hash) });

writeFileSync(TARGET, `${json}\n`);
process.stdout.write(`write-app-key: wrote ${path.relative(process.cwd(), TARGET)}\n`);
