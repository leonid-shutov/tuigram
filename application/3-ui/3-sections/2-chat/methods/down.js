() => {
  if (self.selected === self.messages.tail) return;
  self.selectMessage(self.selected.next);
};
