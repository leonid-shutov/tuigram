// The counterpart of `insert`. Only a pending bubble the server's own copy replaced is dropped.
/** @type {ChatSection['drop']} */
(messageId) => {
  const bubble = self.bubbles.get(messageId);
  if (bubble === undefined) return;
  // Rows below shift up, so the cursor follows.
  const index = self.scroll.getChildren().indexOf(bubble);
  if (index !== -1 && index < self.selectedIndex) self.selectedIndex -= 1;
  self.bubbles.delete(messageId);
  self.pictures.delete(messageId);
  bubble.destroy();
};
