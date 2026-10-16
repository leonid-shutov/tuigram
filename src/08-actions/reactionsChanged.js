/** @type {Actions['reactionsChanged']} */
({ chatId, messageId, reactions }) => {
  const cached = store.chat.findPart(chatId, messageId);
  if (cached === null) return;
  const message = { ...cached, reactions: Message.mergeReactions(cached.reactions, reactions) };
  if (Message.sameReactions(cached, message)) return;
  store.chat.replace(chatId, message, cached.id);
};
