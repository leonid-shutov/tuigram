/** @type {MessengerModule['getLastMessage']} */
async (chatId) => {
  const [last] = await messenger.tg.getHistory(chatId, { limit: 1 });
  return last === undefined ? null : self.toMessage(last);
};
