/** @param {import('../../types/domain').Message} held @param {import('../../types/domain').Message} message */
const sameMedia = (held, message) =>
  held.media.length === message.media.length &&
  held.media.every(
    (medium, i) =>
      medium.type === message.media[i].type &&
      ('fileId' in medium ? medium.fileId : null) === ('fileId' in message.media[i] ? message.media[i].fileId : null),
  );

/** @param {number} chatId @param {number[]} partIds */
const heldPart = (chatId, partIds) => {
  if (!store.chat.isOpen(chatId)) return null;
  return partIds.map((id) => store.chat.findConfirmed(id)).find((found) => found !== null) ?? null;
};

/** @type {Actions['messageEdited']} */
(message, partIds) => {
  const held = heldPart(message.chatId, partIds);

  if (held !== null) {
    const keepMedia = sameMedia(held, message);
    if (held.text === message.text && keepMedia) return;
    const edited = { ...message, media: keepMedia ? held.media : message.media, replyTo: held.replyTo };
    store.chat.replace(edited, held.id);
    if (!keepMedia) actions.loadThumb(edited);
  }

  if (partIds.some((id) => store.dialogs.previews(message.chatId, id))) store.dialogs.setLast(message.chatId, message);
};
