// Photos and videos arrive in two passes. The stripped thumbnail rides along inside the message,
// so it draws on the first frame — blurry, but instant and free. The 320px thumbnail is fetched
// after, and replaces it: ImageRenderable holds the old picture on screen until the new source
// decodes, so the sharpening never flickers. The box is sized from the medium's own dimensions
// (see Media.size), so neither pass moves the layout.
/** @type {ChatSection['Picture']} */
(media) => {
  const protocol = config.imageProtocol;
  if (protocol === 'off') return null;
  if (media === null || (media.type !== 'photo' && media.type !== 'video')) return null;
  const size = Media.size(media);
  if (size === null) return null;

  const image = Image({
    width: size.cols,
    height: size.rows,
    // The cell grid can't match the photo's aspect ratio exactly, so letterbox rather than crop.
    fit: 'fit',
    protocol,
    source: media.preview ?? undefined,
    // A thumbnail that won't decode leaves an empty box; the message itself still reads fine.
    onError: (error) => console.log('thumbnail', error),
  });

  if (media.thumbId !== null) {
    messenger.downloadThumb(media.thumbId).then((bytes) => {
      // The chat may have been switched out from under us; clear() destroys every bubble.
      if (bytes !== null && !image.isDestroyed) image.source = bytes;
    });
  }

  return image;
};
