/** @type {MessengerModule['forwardMessage']} */
async (fromChatId, message, toChatId) => {
  const ids = await self.albumIds(fromChatId, message);
  const sent = await messenger.tg.forwardMessagesById({ fromChatId, toChatId, messages: ids });
  return sent.length > 1 ? self.toAlbum(sent) : self.toMessage(sent[0]);
};
