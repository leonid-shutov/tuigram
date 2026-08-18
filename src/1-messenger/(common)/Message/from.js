(message) => ({
  id: message.id,
  text: message.text,
  placeholder: self.placeholder(message),
  sender: Obj.pick(message.sender, ['id', 'isSelf', 'displayName']),
  chatId: message.chat.id,
  chatName: message.chat.displayName,
  isGroup: message.chat.type === 'chat' && message.chat.isGroup,
});
