/** @typedef {ReturnType<typeof Message.quote>} Quote */

/** @param {number} chatId @param {number} id @param {Quote} resolved */
const landReply = (chatId, id, resolved) => {
  const cached = store.chat.findConfirmed(chatId, id);
  if (cached === null || cached.replyTo === null) return;
  store.chat.replace(chatId, { ...cached, replyTo: { ...cached.replyTo, ...resolved } });
};

/** @type {Actions['loadReplies']} */
(messages) => {
  // Every caller hands over one chat's messages. Replies resolve only into a cached chat that has them,
  // and only its own cached messages are looked through for the originals.
  if (messages.length === 0) return;
  const { chatId } = messages[0];
  /** Replied-to id to the cached messages answering it. @type {Map<number, number[]>} */
  const missing = new Map();
  for (const message of messages) {
    if (!Message.awaitsQuote(message) || !store.chat.hasConfirmed(chatId, message.id)) continue;
    const replyTo = message.replyTo;
    const target = store.chat.findConfirmed(chatId, replyTo.id);
    if (target !== null) {
      landReply(chatId, message.id, Message.quote(target));
      continue;
    }
    const answering = missing.get(replyTo.id) ?? [];
    missing.set(replyTo.id, [...answering, message.id]);
  }
  if (missing.size === 0) return;

  const ids = [...missing.keys()];
  void messenger
    .getMessages(chatId, ids)
    .then((targets) => {
      for (const [index, target] of targets.entries()) {
        for (const id of missing.get(ids[index]) ?? []) landReply(chatId, id, Message.quote(target));
      }
    })
    .catch((error) => Crash.soft(error));
};
