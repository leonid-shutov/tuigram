(event, handler) => {
  if (event === 'message') messenger.dispatcher.onNewMessage((message) => handler(Message.from(message)));
  if (event === 'historyRead') {
    messenger.dispatcher.onHistoryRead((event) =>
      handler(Obj.pick(event, ['chatId', 'isOutbox', 'maxReadId', 'unreadCount'])),
    );
  }
};
