// A post never grows past MAX_WIDTH cells, so a long message wraps at a readable width however wide
// the terminal is; a narrower chat section still squeezes it below that.
const MAX_WIDTH = 100;

// The focusable box a style puts a post's body in: what every style shares, under what it sets. Its
// border is whatever the style draws, and lights up in the `selected` colour while the post is under
// the cursor. The scrollbar of a cut-off text goes down the box's last column (see drawScrollbar):
// its right border, or else a column of its own past the padding that keeps the text off the edge.
//
// The box yields to its slot's height cap (see create.js): `flexShrink: 1` here, and the body's
// picture and text are the two children that shrink in turn (see body.js). `overflow` then clips
// whatever the text hasn't scrolled to, inside the frame.
/** @type {typeof Post.box} */
(options) => {
  const { border } = options;
  const bordersRight = border === true || (Array.isArray(border) && border.includes('right'));
  return Box({
    flexDirection: 'column',
    paddingLeft: 1,
    paddingRight: bordersRight ? 1 : 2,
    maxWidth: MAX_WIDTH,
    flexShrink: 1,
    overflow: 'hidden',
    focusable: true,
    borderStyle: config.theme.borderStyle,
    customBorderChars: config.theme.borderChars,
    focusedBorderColor: config.theme.selected,
    ...options,
  });
};
