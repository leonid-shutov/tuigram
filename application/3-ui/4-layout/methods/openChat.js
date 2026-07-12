(id) => {
  if (self.openedChatId === id) return;
  self.openedChatId = id;
  ui.sections.chat.open(id);
  self.select('chat');
};
