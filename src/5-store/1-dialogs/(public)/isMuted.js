/** @type {DialogsStore['isMuted']} */
(chatId) => self.dialogs.find(chatId)?.isMuted ?? false;
