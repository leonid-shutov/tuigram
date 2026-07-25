({ chatId, name, lastMessage, unreadCount = 0, isUnread = false }) => {
  const unread = unreadCount > 0 || isUnread;
  // Inner text width of the dialogs list: wrapper box is width 30 in
  // 2-component.js, minus borders and left/right gaps. Keep in sync if that changes.
  const width = 26;
  const dotName = name.length > width - 1 ? `${name.slice(0, width - 2)}…●` : `${name.padEnd(width - 1)}●`;
  return { chatId, name: unread ? dotName : name, description: lastMessage ?? '' };
};
