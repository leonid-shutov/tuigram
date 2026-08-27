/** @type {MessengerModule['onNewMessage']} */
(handler) => messenger.dispatcher.onNewMessage((message) => handler(Message.from(message)));
