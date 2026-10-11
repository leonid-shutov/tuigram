// A reply to a deleted message keeps its place but reads as a deleted original, swapped for a new
// copy like any other change (see 2-chat.js).
Mutation(
  self,
  /** @type {ChatStoreSelf['remove']} */
  (ids) => {
    const gone = new Set(ids);
    self.messages = self.messages
      .filter(({ id }) => !gone.has(id))
      .map((message) => {
        const { replyTo } = message;
        if (replyTo === null || replyTo.id === null || !gone.has(replyTo.id)) return message;
        return { ...message, replyTo: { id: replyTo.id, sender: null, preview: null, deleted: true } };
      });
  },
);
