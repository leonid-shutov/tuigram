// `string-width` costs ~8µs a call, so measuring a row one grapheme at a time added up. Most text
// is one code point below U+1100 — Latin, Cyrillic, Greek, Hebrew and Arabic letters — which is
// always one cell; only the rest (CJK, emoji, clusters) is measured, and so are marks and format
// characters, which `string-width` gives no cell (the soft hyphen, the Arabic letter mark, a mark
// with nothing to sit on). Checked exhaustively against string-width 9: every other lone code
// point below U+1100 is one cell.
const segmenter = new Intl.Segmenter();
const MARK_OR_FORMAT = /[\p{M}\p{Cf}]/u;

/** @param {string} grapheme */
const widthOf = (grapheme) => {
  if (grapheme.length !== 1) return Cells.width(grapheme);
  const code = grapheme.charCodeAt(0);
  const isControl = code < 0x20 || (code >= 0x7f && code < 0xa0);
  if (isControl || code >= 0x1100 || MARK_OR_FORMAT.test(grapheme)) return Cells.width(grapheme);
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
