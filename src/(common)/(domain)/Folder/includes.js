// mtcute's Dialog.filterFolder, ported to our Dialog so a folder stays live as chats change. The
// precedence is Telegram's: an included chat always shows, an excluded or pinned one is decided
// by its list alone, and only then do the exclude flags and the kind rules apply.
/** @type {typeof Folder.includes} */
(folder, { chatId, kind, isContact, isMuted, isArchived, isUnread, unreadCount }) => {
  if (folder.includeIds.has(chatId) || folder.pinnedIds.includes(chatId)) return true;
  if (folder.isChatlist || folder.excludeIds.has(chatId)) return false;

  const { rules } = folder;
  if (rules.excludeRead && !isUnread && unreadCount === 0) return false;
  if (rules.excludeMuted && isMuted) return false;
  if (rules.excludeArchived && isArchived) return false;

  if (kind === 'user') return isContact ? rules.contacts : rules.nonContacts;
  if (kind === 'bot') return rules.bots;
  if (kind === 'group') return rules.groups;
  if (kind === 'channel') return rules.broadcasts;
  return false;
};
