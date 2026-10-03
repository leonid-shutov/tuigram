/** @type {DialogsStore['find']} */
(chatId) => self.list.find(chatId) ?? self.archive.find(chatId);
