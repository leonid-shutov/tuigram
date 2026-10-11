// A pending message has no chat until the server confirms it, so `chatId` is the tell.
/** @type {typeof Message.isConfirmed} */
(message) => message !== null && message.chatId !== undefined;
