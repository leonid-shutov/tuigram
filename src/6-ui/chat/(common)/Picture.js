/** @type {typeof Picture} */
(media, protocol) => {
  const size = Media.size(media);
  if (size === null) return null;

  return Image({
    width: size.cols,
    height: size.rows,
    // The cell grid can't match the photo's aspect ratio exactly, so letterbox rather than crop.
    fit: 'fit',
    protocol,
    source: media.preview ?? undefined,
    onError: (error) => console.log('thumbnail', error),
  });
};
