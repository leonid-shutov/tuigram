({
  from: ({ peer, lastMessage }) => ({
    chatId: lastMessage.chat.id,
    name: peer.displayName,
    lastMessage: lastMessage.text,
  }),
});
