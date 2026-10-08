/** @type {typeof Option.key} */
({ name, lastMessage, unreadCount, isUnread, isMuted }) =>
  [name, Message.preview(lastMessage), unreadCount, isUnread, isMuted, config.dialogEmoji].join('\0');
