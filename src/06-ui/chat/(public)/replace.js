/** @type {ChatSection['replace']} */
(message) => {
  const text = self.bubbles.get(message.id)?.text ?? null;
  if (text !== null) text.content = message.text;
};
