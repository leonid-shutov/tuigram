({
  from: ({ id, text, sender, chat }) => ({
    id,
    text,
    sender: Obj.pick(sender, ['id', 'isSelf', 'displayName']),
    chatId: chat.id,
    chatName: chat.displayName,
    isGroup: chat.type === 'chat' && chat.isGroup,
  }),
});
