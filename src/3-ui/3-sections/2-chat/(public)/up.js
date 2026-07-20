() => {
  if (self.selected === self.messages.head) return;
  self.selectMessage(self.selected.prev);
};
