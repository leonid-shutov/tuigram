/** @type {typeof Option.key} */
({ name, lastMessage, unreadCount, isUnread, isMuted }, glyph) =>
  [name, Message.preview(lastMessage), unreadCount, isUnread, isMuted, glyph, screen.size.dialogsWidth].join('\0');
