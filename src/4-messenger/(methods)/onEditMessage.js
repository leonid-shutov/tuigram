/** @type {MessengerModule['onEditMessage']} */
(handler) =>
  messenger.dispatcher.onEditMessage(async (message) => {
    if (message.groupedId === null) {
      handler(self.toMessage(message), [message.id]);
      return;
    }
    const parts = await messenger.tg.getMessageGroup({ chatId: message.chat.id, message: message.id });
    handler(
      self.toAlbum(parts),
      parts.map(({ id }) => id),
    );
  });
