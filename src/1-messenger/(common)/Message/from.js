(message) => ({
  id: message.id,
  text: message.text,
  media: Media.from(message),
  sender: Obj.pick(message.sender, ['id', 'isSelf', 'displayName']),
  chatId: message.chat.id,
  chatName: message.chat.displayName,
  isGroup: message.chat.type === 'chat' && message.chat.isGroup,
});
