/** @type {DialogsSelf['isMuted']} */
(chatId) => self.dialogs.find(chatId)?.isMuted ?? false;
