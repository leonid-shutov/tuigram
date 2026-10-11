// The app folds an album into one message under one part's id; forwarding that id alone would
// send that single picture, so an album asks Telegram for all of its parts first.
/** @type {MessengerModule['forwardMessage']} */
async (fromChatId, message, toChatId) => {
  let ids = [message.id];
  if (message.media.length > 1) {
    const parts = await messenger.tg.getMessageGroup({ chatId: fromChatId, message: message.id });
    ids = parts.map((part) => part.id);
  }
  const sent = await messenger.tg.forwardMessagesById({ fromChatId, toChatId, messages: ids });
  return sent.length > 1 ? self.toAlbum(sent) : self.toMessage(sent[0]);
};
