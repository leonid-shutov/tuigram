/** @type {MessengerModule['onPresenceUpdate']} */
(handler) =>
  messenger.dispatcher.onUserStatusUpdate((event) => {
    const presence = Presence.from(event);
    if (presence) handler(event.userId, presence);
  });
