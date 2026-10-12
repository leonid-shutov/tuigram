/** @type {typeof Option.key} */
({ name, lastMessage, unreadCount, isUnread, isMuted }) =>
  [
    name,
    Message.preview(lastMessage),
    unreadCount,
    isUnread,
    isMuted,
    config.dialogEmoji,
    screen.size.dialogsWidth,
  ].join('\0');
