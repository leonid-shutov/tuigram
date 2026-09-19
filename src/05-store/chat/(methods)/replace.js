/** @type {ChatStore['replace']} */
(message) => {
  const index = self.messages.findIndex(({ id }) => id === message.id);
  if (index === -1) Crash.hard(new Error(`message ${message.id} is not held`));
  self.messages[index] = message;
};
