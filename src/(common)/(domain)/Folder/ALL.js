// Telegram's "All chats" has no rules to evaluate: the dialogs store shows its main list for it.
/** @type {typeof Folder.ALL} */
({
  id: 0,
  title: 'All chats',
  isChatlist: false,
  pinnedIds: [],
  includeIds: new Set(),
  excludeIds: new Set(),
  rules: {
    contacts: false,
    nonContacts: false,
    groups: false,
    broadcasts: false,
    bots: false,
    excludeMuted: false,
    excludeRead: false,
    excludeArchived: false,
  },
});
