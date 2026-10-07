/** @type {ChatSection['drop']} */
(messageId) => {
  const entry = self.bubbles.get(messageId);
  if (entry === undefined) return;
  const index = self.boxes.indexOf(entry.box);
  if (index !== -1 && index < self.selectedIndex) self.selectedIndex -= 1;
  self.bubbles.delete(messageId);
  entry.box.destroy();
  self.redate();
};
