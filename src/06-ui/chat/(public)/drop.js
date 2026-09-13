/** @type {ChatSection['drop']} */
(messageId) => {
  const entry = self.bubbles.get(messageId);
  if (entry === undefined) return;
  const index = self.scroll.getChildren().indexOf(entry.bubble);
  if (index !== -1 && index < self.selectedIndex) self.selectedIndex -= 1;
  self.bubbles.delete(messageId);
  entry.bubble.destroy();
};
