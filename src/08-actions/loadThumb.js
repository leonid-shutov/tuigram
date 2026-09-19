/** @type {Actions['loadThumb']} */
({ id, media }) => {
  if (!Media.isImage(media)) return;
  const { thumbId } = media;
  if (thumbId === null) return;
  void messenger
    .downloadThumb(thumbId)
    .then((bytes) => {
      if (bytes !== null) ui.chat.setThumb(id, bytes);
    })
    .catch((error) => Crash.soft(error));
};
