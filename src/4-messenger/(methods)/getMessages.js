// Album parts come back one by one, unfolded: whoever asks wants a single part's text or medium.
/** @type {MessengerModule['getMessages']} */
async (chatId, ids) => {
  const messages = await messenger.tg.getMessages(chatId, ids);
  return messages.map((message) => (message === null ? null : self.toMessage(message)));
};
