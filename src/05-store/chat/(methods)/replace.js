/** @type {ChatStore['replace']} */
(message) => {
  const index = self.messages.findIndex(({ id }) => id === message.id);
  if (index === -1) throw new Error();
  self.messages[index] = message;
};
