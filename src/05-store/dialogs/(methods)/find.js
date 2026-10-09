/** @type {DialogsStoreSelf['find']} */
(chatId) => self.list.find(chatId) ?? self.archive.find(chatId);
