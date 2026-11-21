// Every picture in an album is drawn in one slot, so flipping through it never reflows the chat:
// the first drawable medium decides, and the rest letterbox into it (Picture's `fit: 'fit'`).
/** @type {typeof Bubble.albumSize} */
(media) => {
  for (const medium of media) {
    const size = Media.isImage(medium) ? Bubble.size(medium) : null;
    if (size !== null) return size;
  }
  return null;
};
