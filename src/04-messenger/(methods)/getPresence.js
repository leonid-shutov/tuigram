/** @type {MessengerModule['getPresence']} */
async (chatId) => {
  const [user] = await messenger.tg.getUsers([chatId]);
  return user ? Presence.from(user) : null;
};
