/** @type {MessengerModule['sendMessage']} */
(chatId, text, replyTo) => messenger.tg.sendText(chatId, text, { replyTo }).then(self.toMessage);
