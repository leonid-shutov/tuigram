/** @type {ChatSelf['down']} */
() => {
  if (self.selectedMessage === self.messages.tail) return;
  self.selectMessage(self.selectedMessage?.next ?? null);
};
