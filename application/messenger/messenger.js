({
  chatId: undefined,
  switchChat: (chatId) => (self.chatId = chatId),
  sendText: (msg) => tg.sendText(self.chatId, msg),
});
