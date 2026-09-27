/** @type {ChatSection['replace']} */
(message) => {
  const view = self.bubbles.get(message.id);
  if (view !== undefined) Bubble.update(view, message);
};
