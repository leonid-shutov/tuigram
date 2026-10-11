/** @param {import('@mtcute/node').PeerSender} sender */
const toPeer = (sender) => ({
  id: sender.type === 'anonymous' ? null : sender.id,
  displayName: sender.displayName,
});

/** @param {import('@mtcute/node').Message} message @returns {import('../../../types/domain').Message['replyTo']} */
const toReplyTo = (message) => {
  if (message.replyToStory !== null) return { id: null, sender: null, preview: '📖 Story', deleted: false };
  const info = message.replyToMessage;
  if (info === null) return null;
  const sender = info.sender === null ? null : toPeer(info.sender);
  return { id: info.id, sender, preview: info.quoteText === '' ? null : info.quoteText, deleted: false };
};

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
  forwardedFrom: message.forward === null ? null : toPeer(message.forward.sender),
  replyTo: toReplyTo(message),
  date: message.date,
  deleteScopes: self.deleteScopesOf(message),
});
