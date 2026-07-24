({
  from: ({ peer, lastMessage, isPinned }) => ({
    chatId: lastMessage.chat.id,
    name: peer.displayName,
    lastMessage: lastMessage.text,
    isPinned,
  }),
});
