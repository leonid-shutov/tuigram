/** @type {typeof Message.from} */
(message) => ({
  id: message.id,
  text: message.text,
  media: Media.from(message),
  pending: false,
  sender: {
    ...Obj.pick(message.sender, ['id', 'displayName']),
    isSelf: message.sender.type === 'user' ? message.sender.isSelf : false,
  },
  chatId: message.chat.id,
  chatName: message.chat.displayName,
  isGroup: message.chat.type === 'chat' && message.chat.isGroup,
});
