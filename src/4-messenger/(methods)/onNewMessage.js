// With `messageGroupingInterval` set on the client (3-auth), mtcute collects a live album's
// parts into one message group instead of dispatching each as a new message.
/** @type {MessengerModule['onNewMessage']} */
(handler) => {
  messenger.dispatcher.onNewMessage((message) => handler(self.toMessage(message)));
  messenger.dispatcher.onMessageGroup((group) => handler(self.toAlbum(group.messages)));
};
