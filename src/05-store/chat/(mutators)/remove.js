// A reply to a deleted message keeps its place but reads as a deleted original, swapped for a new
// copy like any other change (see 2-chat.js).
ChatMutation(
  /** @type {ChatMutator<ChatStoreSelf['remove']>} */
  (chat, ids) => {
    const gone = new Set(ids);
    chat.messages = chat.messages
      .filter(({ id }) => !gone.has(id))
      .map((message) => {
        const { replyTo } = message;
        if (replyTo === null || replyTo.id === null || !gone.has(replyTo.id)) return message;
        return { ...message, replyTo: { id: replyTo.id, sender: null, preview: null, deleted: true } };
      });
  },
);
