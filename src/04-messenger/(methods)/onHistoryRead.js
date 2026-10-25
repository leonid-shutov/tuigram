// A thread's or a topic's read carries that thread's mark and count, not the chat's: passed over.
/** @type {MessengerModule['onHistoryRead']} */
(handler) =>
  messenger.dispatcher.onHistoryRead((event) => {
    if (event.isDiscussion) return;
    handler(Obj.pick(event, ['chatId', 'isOutbox', 'maxReadId', 'unreadCount']));
  });
