// The stream may have delivered the server's copy before `send` returned it: then the pending
// entry simply goes. A pending entry already dropped is nothing to confirm.
ChatMutation(
  /** @type {ChatMutator<ChatStoreSelf['confirm']>} */
  (chat, tempId, message) => {
    const index = chat.messages.findIndex(({ id }) => id === tempId);
    if (index === -1) return;
    const isCached = chat.messages.some((cached) => Message.isConfirmed(cached) && cached.id === message.id);
    if (isCached) chat.messages.splice(index, 1);
    else chat.messages[index] = message;
  },
);
