/** @type {typeof Bubble.flipAlbum} */
(view, step) => {
  const count = view.message.media.length;
  if (count < 2) return;
  view.mediumIndex = (view.mediumIndex + step + count) % count;
  Bubble.paint(view);
};
