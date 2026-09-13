/** @type {MessengerModule['onHistoryRead']} */
(handler) =>
  messenger.dispatcher.onHistoryRead((event) =>
    handler(Obj.pick(event, ['chatId', 'isOutbox', 'maxReadId', 'unreadCount'])),
  );
