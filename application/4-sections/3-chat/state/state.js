({
  chatId: undefined,
  iterator: null,
  messages: [],
  selected: null,
  //window: { start: 0, end: module.ui.getMaxLines() - 1 },

  async open(chatId, iterator) {
    self.chatId = chatId;
    const { value: messages } = await iterator.next();
    self.messages = messages;
  },
});
