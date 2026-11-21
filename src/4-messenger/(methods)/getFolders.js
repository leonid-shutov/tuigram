// Telegram lists "All chats" where the user placed it; an account that never moved it may leave
// it out, in which case it heads the list as in the official apps.
/** @type {MessengerModule['getFolders']} */
async () => {
  const { filters } = await messenger.tg.getFolders();
  const folders = filters.map(self.toFolder);
  return folders.includes(Folder.ALL) ? folders : [Folder.ALL, ...folders];
};
