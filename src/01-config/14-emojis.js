// The glyphs set by hand (08-actions/pickEmoji.js), by chat id. emojis.json is the app's own, but a
// hand edit can leave anything in it: an entry that isn't a chat id with a catalog glyph is dropped,
// and a missing or unreadable file is no emojis at all.
/** @type {Map<number, string>} */
const emojis = new Map();

const read = Result.from(() => node.fs.readFileSync(config.paths.emojis, 'utf8'));
const parsed = read.ok ? Result.from(() => JSON.parse(read.unwrap())) : read;
const entries = parsed.ok && typeof parsed.unwrap() === 'object' ? Object.entries(parsed.unwrap() ?? {}) : [];
for (const [key, glyph] of entries) {
  const chatId = Number(key);
  const known = Emoji.catalog.some((entry) => entry.glyph === glyph);
  if (Number.isSafeInteger(chatId) && known) emojis.set(chatId, glyph);
}

emojis;
