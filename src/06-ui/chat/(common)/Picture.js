// A picture is the first child to give up rows once the bubble hits its height cap (see
// Bubble/create.js): flexShrink is a large weight relative to the text's `1`, so yoga hands nearly all
// of the overflow to the picture, down to MIN_ROWS, before the text starts shrinking (and
// scrolling) at all. `fit: 'fit'` then letterboxes the shrunk picture instead of cropping it.
// It starts empty: `Bubble.paint` sets the source of whichever part is on screen.
const PICTURE_SHRINK = 1000;
const MIN_ROWS = 10;

/** @type {typeof Picture} */
(protocol, size) =>
  Image({
    width: size.cols,
    height: size.rows,
    minHeight: Math.min(size.rows, MIN_ROWS),
    flexShrink: PICTURE_SHRINK,
    // The cell grid can't match the photo's aspect ratio exactly, so letterbox rather than crop.
    fit: 'fit',
    protocol,
    visible: false,
    onError: (error) => console.log('thumbnail', error),
  });
