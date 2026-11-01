// Rendezvous hashing: every `auto` glyph scores the chat, and the highest score wins. The result hangs
// on nothing but the glyph and the chat, so the catalog's order means nothing to it, and marking or
// unmarking one glyph moves only the chats that glyph now wins or held — not everyone's, as indexing
// by `hash % count` would. The glyph goes first in the key: FNV-1a mixes the last few characters
// poorly, and with the glyph last the chats piled up on a few glyphs.
/** @type {string[] | null} */
let auto = null;
/** @type {Map<number, string>} */
const picked = new Map();

/** @type {typeof Emoji.fromHash} */
(chatId) => {
  const held = picked.get(chatId);
  if (held !== undefined) return held;
  auto ??= Emoji.catalog.flatMap((entry) => (entry.auto ? [entry.glyph] : []));
  let best = auto[0];
  let bestScore = -1;
  for (const glyph of auto) {
    const score = Hash.fnv1a(`${glyph}${chatId}`);
    if (score > bestScore) {
      best = glyph;
      bestScore = score;
    }
  }
  picked.set(chatId, best);
  return best;
};
