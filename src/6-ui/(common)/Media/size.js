// Bubble dimensions, in cells, for a medium the chat can draw.
//
// Sized from the full medium's own width and height, which ride along with the message — never
// from the decoded thumbnail. That keeps a bubble's height final from the moment it is built, so
// the 320px thumbnail landing later never reflows the chat. `loadMore` depends on this:
// `ScrollBox.preserveScroll` anchors the viewport on measured content height, and an image that
// resized itself afterwards would fight it.
//
// Terminal cells run about twice as tall as they are wide, so a square image wants half as many
// rows as columns. Photos are drawn at a uniform width, narrowing only when a tall one would
// otherwise run past the row cap and swallow the pane.
const COLS = 40;
const MAX_ROWS = 20;
const CELL_ASPECT = 2;

/** @type {typeof Media.size} */
(media) => {
  const { width, height } = media;
  // A medium whose dimensions the sender omitted has nothing to lay out from.
  if (!(width > 0) || !(height > 0)) return null;

  const rows = Math.round((COLS * height) / (width * CELL_ASPECT));
  if (rows > MAX_ROWS) {
    return { cols: Math.max(1, Math.round((MAX_ROWS * CELL_ASPECT * width) / height)), rows: MAX_ROWS };
  }
  return { cols: COLS, rows: Math.max(1, rows) };
};
