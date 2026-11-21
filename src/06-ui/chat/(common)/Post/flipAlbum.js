/** @type {typeof Post.flipAlbum} */
(view, step) => {
  const count = view.message.media.length;
  if (count < 2) return;
  view.mediumIndex = (view.mediumIndex + step + count) % count;
  Post.paint(view);
};
