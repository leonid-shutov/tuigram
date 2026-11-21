/** @type {MessengerModule['onPresenceUpdate']} */
(handler) =>
  messenger.dispatcher.onUserStatusUpdate((event) => {
    const presence = self.toPresence(event);
    if (presence) handler(event.userId, presence);
  });
