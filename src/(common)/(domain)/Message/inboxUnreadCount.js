// Counted the way Telegram counts unread: every part of an album, and only the parts past `after`.
/** @type {typeof Message.inboxUnreadCount} */
(messages, after) => {
  let count = 0;
  for (const message of messages) {
    if (!Message.isConfirmed(message) || message.sender.isSelf) continue;
    count += message.partIds.filter((id) => id > after).length;
  }
  return count;
};
