/** @param {import('../../types/domain').Message} cached @param {import('../../types/domain').Message} message */
const sameMedia = (cached, message) =>
  cached.media.length === message.media.length &&
  cached.media.every(
    (medium, i) =>
      medium.type === message.media[i].type &&
      ('fileKey' in medium ? medium.fileKey : null) ===
        ('fileKey' in message.media[i] ? message.media[i].fileKey : null),
  );

/** @param {number} chatId @param {number[]} partIds */
const cachedPart = (chatId, partIds) =>
  partIds.map((id) => store.chat.findPart(chatId, id)).find((found) => found !== null) ?? null;

// An edit carries the message's whole current state, reactions included — and in a private chat a
// reaction arrives as nothing but a hidden edit, with the text and media unchanged.
/** @type {Actions['messageEdited']} */
(message, partIds) => {
  const cached = cachedPart(message.chatId, partIds);

  if (cached !== null) {
    const keepMedia = sameMedia(cached, message);
    const edited = {
      ...message,
      media: keepMedia ? cached.media : message.media,
      replyTo: cached.replyTo,
      reactions: Message.mergeReactions(cached.reactions, message.reactions),
    };
    if (Message.sameText(cached, message) && keepMedia && Message.sameReactions(cached, edited)) return;
    store.chat.replace(message.chatId, edited, cached.id);
    if (!keepMedia) actions.loadThumb(edited);
  }

  if (partIds.some((id) => store.dialogs.previews(message.chatId, id))) store.dialogs.setLast(message.chatId, message);
};
