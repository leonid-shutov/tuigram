/** @type {ChatSection['append']} */
(message) => {
  const bubble = self.Bubble(message);
  self.component.add(bubble);
  self.bubbles.set(message.id, bubble);
};
