/** @type {MessengerModule['deleteMessage']} */
async (chatId, message, scope) => {
  const ids = await self.albumIds(chatId, message);
  await messenger.tg.deleteMessagesById(chatId, ids, { revoke: scope === 'everyone' });
};
