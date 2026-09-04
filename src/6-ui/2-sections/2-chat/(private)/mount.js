/** @type {ChatSelf['mount']} */
(message) => {
  const bubble = self.Bubble(message);
  self.bubbles.set(message.id, bubble);
  return bubble;
};
