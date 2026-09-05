/** @type {ChatStore['open']} */
(chatId) => {
  self.chatId = chatId;
  self.messages = [];
  self.readUpTo = 0;
};
