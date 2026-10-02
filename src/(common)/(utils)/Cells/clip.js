// Whole graphemes only: a wide character that would straddle the edge is dropped, not split.
/** @type {typeof Cells.clip} */
(text, width) => {
  let clipped = '';
  let used = 0;
  for (const { segment } of new Intl.Segmenter().segment(text)) {
    const cells = Cells.width(segment);
    if (used + cells > width) break;
    clipped += segment;
    used += cells;
  }
  return clipped;
};
