/** @type {ChatStore['open']} */
(chatId, pager) => {
  self.chatId = chatId;
  self.messages = [];
  self.readUpTo = 0;
  self.pager = pager;
};
