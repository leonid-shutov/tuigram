/** @type {MessengerModule['editMessage']} */
(chatId, messageId, text) => messenger.tg.editMessage({ chatId, message: messageId, text }).then(Message.from);
