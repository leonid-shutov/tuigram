(id) => {
  if (self.openedChatId === id) return;
  ui.sections.chat.open(id);
  self.select('chat');
  self.openedChatId = id;
};
