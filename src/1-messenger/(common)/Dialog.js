({
  from: ({ peer, lastMessage, isPinned, unreadCount, isUnread, isMuted }) => ({
    chatId: lastMessage.chat.id,
    name: peer.displayName,
    lastMessage: lastMessage.text,
    isPinned,
    unreadCount,
    isUnread,
    isMuted,
  }),
});
