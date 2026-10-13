// An album part is edited on its own, but the app only knows the folded message: the whole group
// is fetched, so the caption (and the id that carries it) is read off the parts as they stand now.
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
