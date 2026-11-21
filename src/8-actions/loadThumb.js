// A thumbnail lands on its medium in the store, and the bubble redraws from the updated message —
// so it outlives an album flip, and an edit carries it forward with the rest of the media.
/** @type {Actions['loadThumb']} */
({ id, chatId, media }) => {
  if (!store.chat.isOpen(chatId) || !store.chat.hasConfirmed(chatId, id)) return;
  for (const [index, medium] of media.entries()) {
    if (!Media.isImage(medium) || medium.thumbId === null || medium.thumbKey === null || medium.thumb !== null) {
      continue;
    }
    void messenger
      .downloadThumb(medium.thumbId, medium.thumbKey)
      .then((path) => {
        // The message may have been dropped, or its chat evicted, while the download ran.
        const cached = store.chat.findConfirmed(chatId, id);
        if (path === null || cached === null) return;
        const part = cached.media[index];
        if (!Media.isImage(part)) return;
        const message = { ...cached, media: cached.media.with(index, { ...part, thumb: path }) };
        store.chat.replace(chatId, message);
      })
      .catch((error) => Crash.soft(error));
  }
};
