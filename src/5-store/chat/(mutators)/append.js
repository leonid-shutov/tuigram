// A closed chat grows only here, by what arrives live, so this is where it is kept in bounds.
/** @type {ChatMutator<ChatStoreSelf['append']>} */
const append = (chat, message) => {
  chat.messages.push(message);
  if (chat !== self.opened) self.trim(chat);
};

ChatMutation(append);
