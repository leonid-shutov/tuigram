/** @type {ChatSection['drop']} */
(messageId) => {
  const bubble = self.bubbles.get(messageId);
  if (bubble === undefined) return;
  const index = self.scroll.getChildren().indexOf(bubble);
  if (index !== -1 && index < self.selectedIndex) self.selectedIndex -= 1;
  self.bubbles.delete(messageId);
  self.pictures.delete(messageId);
  bubble.destroy();
};
