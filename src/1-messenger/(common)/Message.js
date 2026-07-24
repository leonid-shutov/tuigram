({
  from: ({ id, text, sender, chat }) => ({
    id,
    text,
    sender: Obj.pick(sender, ['isSelf']),
    chatId: chat.id,
    chatName: chat.displayName,
  }),
});
