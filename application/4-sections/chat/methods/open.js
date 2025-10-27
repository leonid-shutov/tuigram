async (chatId) => {
  const chat = await messenger.getChat(chatId);
  module.key(chat.join("\n"));
  screen.render();
};
