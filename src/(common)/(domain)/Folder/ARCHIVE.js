// Telegram's archive is a second dialog list rather than a filter, but the folder bar is the only
// way into the chat list, so it takes a folder's shape to sit there. 1 is the folder id Telegram
// reserves for it; the user's own folders start at 2.
/** @type {typeof Folder.ARCHIVE} */
({
  id: 1,
  title: 'Archived chats',
  isChatlist: false,
  pinnedIds: [],
  includeIds: new Set(),
  excludeIds: new Set(),
  rules: { ...Folder.ALL.rules },
});
