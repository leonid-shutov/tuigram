/** @type {DialogsStoreSelf['previews']} */
(chatId, messageId) => self.find(chatId)?.lastMessage?.id === messageId;
