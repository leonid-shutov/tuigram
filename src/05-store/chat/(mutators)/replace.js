ChatMutation(
  /** @type {ChatMutator<ChatStoreSelf['replace']>} */
  (chat, message, replacedId = message.id) => {
    const index = chat.messages.findIndex(({ id }) => id === replacedId);
    if (index === -1) Crash.hard(new Error(`message ${replacedId} is not cached`));
    chat.messages[index] = message;
  },
);
