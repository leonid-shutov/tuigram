/** @type {MessengerSelf['toMessage']} */
(message) => ({
  id: message.id,
  text: message.text,
  media: [self.toMedia(message)].filter((medium) => medium !== null),
  pending: false,
  sender: {
    ...Obj.pick(message.sender, ['id', 'displayName']),
    isSelf: message.sender.type === 'user' ? message.sender.isSelf : false,
  },
  chatId: message.chat.id,
  chatName: message.chat.displayName,
  isGroup: message.chat.type === 'chat' && message.chat.isGroup,
  forwardedFrom:
    message.forward === null
      ? null
      : {
          id: message.forward.sender.type === 'anonymous' ? null : message.forward.sender.id,
          displayName: message.forward.sender.displayName,
        },
});
