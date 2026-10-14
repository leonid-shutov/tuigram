// A closed chat grows only here, by what arrives live, so this is where it is kept in bounds.
ChatMutation(
  /** @type {ChatMutator<ChatStoreSelf['append']>} */
  (chat, message) => {
    chat.messages.push(message);
    if (chat !== self.opened) self.trim(chat);
  },
);
