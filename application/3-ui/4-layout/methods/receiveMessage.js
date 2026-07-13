(message) => {
  if (self.openedChatId === message.chatId) ui.sections.chat.addMessage(message);
};
