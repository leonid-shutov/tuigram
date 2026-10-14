/** @param {import('../../types/domain').Message} cached @param {import('../../types/domain').Message} message */
const sameMedia = (cached, message) =>
  cached.media.length === message.media.length &&
  cached.media.every(
    (medium, i) =>
      medium.type === message.media[i].type &&
      ('fileId' in medium ? medium.fileId : null) === ('fileId' in message.media[i] ? message.media[i].fileId : null),
  );

/** @param {number} chatId @param {number[]} partIds */
const cachedPart = (chatId, partIds) =>
  partIds.map((id) => store.chat.findConfirmed(chatId, id)).find((found) => found !== null) ?? null;

/** @type {Actions['messageEdited']} */
(message, partIds) => {
  const cached = cachedPart(message.chatId, partIds);

  if (cached !== null) {
    const keepMedia = sameMedia(cached, message);
    if (cached.text === message.text && keepMedia) return;
    const edited = { ...message, media: keepMedia ? cached.media : message.media, replyTo: cached.replyTo };
    store.chat.replace(message.chatId, edited, cached.id);
    if (!keepMedia) actions.loadThumb(edited);
  }

  if (partIds.some((id) => store.dialogs.previews(message.chatId, id))) store.dialogs.setLast(message.chatId, message);
};
