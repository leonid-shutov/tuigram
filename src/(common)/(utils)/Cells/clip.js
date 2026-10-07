// `string-width` costs ~8µs a call, and the dialog list clips every row's name and preview on
// each repaint — measured one grapheme at a time, that was ~0.25ms a row. Text repeats the same
// few hundred graphemes, so each is measured once. The cap only guards against a pathological
// stream of distinct graphemes; real text never gets near it.
const MAX_CACHED = 10_000;
const segmenter = new Intl.Segmenter();
/** @type {Map<string, number>} */
const widths = new Map();

/** @param {string} grapheme */
const widthOf = (grapheme) => {
  let cells = widths.get(grapheme);
  if (cells === undefined) {
    if (widths.size >= MAX_CACHED) widths.clear();
    cells = Cells.width(grapheme);
    widths.set(grapheme, cells);
  }
  return cells;
};

// Whole graphemes only: a wide character that would straddle the edge is dropped, not split.
/** @type {typeof Cells.clip} */
(text, width) => {
  let clipped = '';
  let used = 0;
  for (const { segment } of segmenter.segment(text)) {
    const cells = widthOf(segment);
    if (used + cells > width) break;
    clipped += segment;
    used += cells;
  }
  return clipped;
};
