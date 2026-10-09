// `string-width` costs ~8µs a call, so measuring a row one grapheme at a time added up. Most text
// is one code point below U+1100 — Latin, Cyrillic, Greek — printable and not combining, which is
// always one cell; only the rest (CJK, emoji, clusters) is measured. The exceptions in that range
// are the ones `string-width` disagrees on: © and ® count as emoji, the soft hyphen and the Arabic
// letter mark as nothing.
const segmenter = new Intl.Segmenter();
const EXCEPTIONS = new Set(['©', '®', '\u00ad', '\u061c']);

/** @param {string} grapheme */
const widthOf = (grapheme) => {
  if (grapheme.length !== 1 || EXCEPTIONS.has(grapheme)) return Cells.width(grapheme);
  const code = grapheme.charCodeAt(0);
  const isControl = code < 0x20 || (code >= 0x7f && code < 0xa0);
  const isCombining = code >= 0x300 && code <= 0x36f;
  if (isControl || isCombining || code >= 0x1100) return Cells.width(grapheme);
  return 1;
};

// Whole graphemes only: a wide character that would straddle the edge is dropped, not split.
// Returns the width it used too, so a caller padding the result needn't measure it again.
/** @type {typeof Cells.cut} */
(text, width) => {
  let clipped = '';
  let used = 0;
  for (const { segment } of segmenter.segment(text)) {
    const cells = widthOf(segment);
    if (used + cells > width) break;
    clipped += segment;
    used += cells;
  }
  return { text: clipped, cells: used };
};
