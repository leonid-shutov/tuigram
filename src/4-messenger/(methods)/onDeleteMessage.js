/** @type {MessengerModule['onDeleteMessage']} */
(handler) =>
  messenger.dispatcher.onDeleteMessage((update) =>
    handler({ channelId: update.channelId, messageIds: update.messageIds }),
  );
