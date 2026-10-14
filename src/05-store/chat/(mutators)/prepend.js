// A page lands under the chat's oldest confirmed message, and only what is older than it does: the
// rest is cached already, or arrived live, above it. So a page that lands twice — a chat opened
// while its preload is in flight fetches it again — adds nothing the second time, and what was
// sent or arrived while a page was in flight stays below the history.
ChatMutation(
  /** @type {ChatMutator<ChatStoreSelf['prepend']>} */
  (chat, older) => {
    const oldest = chat.messages.find(Message.isConfirmed);
    const landed = oldest === undefined ? older : older.filter(({ id }) => id < oldest.id);
    chat.messages.unshift(...landed);
    return landed;
  },
);
