// A thumbnail lands on its medium in the store, and the bubble redraws from the updated message —
// so it outlives an album flip, and an edit carries it forward with the rest of the media.
/** @type {Actions['loadThumb']} */
({ id, chatId, media }) => {
  for (const [index, medium] of media.entries()) {
    if (!Media.isImage(medium) || medium.thumbId === null) continue;
    void messenger
      .downloadThumb(medium.thumbId)
      .then((path) => {
        // The chat may have been switched, or the message dropped, while the download ran.
        if (path === null || store.chat.chatId !== chatId) return;
        const held = store.chat.messages.find((message) => message.id === id);
        // A pending message (no chatId yet) is ours, still uploading: nothing of it is fetched.
        if (held === undefined || held.chatId === undefined) return;
        const part = held.media[index];
        if (!Media.isImage(part)) return;
        const message = { ...held, media: held.media.with(index, { ...part, thumb: path }) };
        store.chat.replace(message);
        actions.repaintChat();
      })
      .catch((error) => Crash.soft(error));
  }
};
