/** @typedef {ReturnType<typeof Message.quote>} Quote */

/** @param {number} chatId @param {number} id @param {Quote} resolved */
const landReply = (chatId, id, resolved) => {
  if (store.chat.chatId !== chatId) return;
  const held = store.chat.findConfirmed(id);
  if (held === null || held.replyTo === null) return;
  store.chat.replace({ ...held, replyTo: { ...held.replyTo, ...resolved } });
};

/** @type {Actions['loadReplies']} */
(messages) => {
  // Replies resolve only into the open chat — the one the store holds. Read once, it is also what
  // a fetch's answer is checked against, in case the chat was switched while it ran.
  const chatId = store.chat.chatId;
  if (chatId === null) return;
  /** Replied-to id to the held messages answering it. @type {Map<number, number[]>} */
  const missing = new Map();
  for (const message of messages) {
    if (message.chatId !== chatId || !Message.awaitsQuote(message)) continue;
    const replyTo = message.replyTo;
    const target = store.chat.findConfirmed(replyTo.id);
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
