/** @type {ChatSelf['insert']} */
(message, index) => {
  const view = Bubble.create(message);
  self.scroll.add(view.box, index);
  self.bubbles.set(message.id, view);
};
