// @ts-check
/**
 * @param {import('@mtcute/node').Message} message
 * @returns {import('../../../../types/domain').AppMessage}
 */
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
