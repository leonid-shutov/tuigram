// What the official clients offer. A user chat revokes for both sides (a bot's only for us); a
// basic group lets anyone revoke their own and admins anyone's; a supergroup and a channel only
// revoke, and only for their own messages or with the admin right to.
/** @type {MessengerSelf['deleteScopesOf']} */
(message) => {
  const { chat } = message;
  if (message.isService) return [];
  if (chat.type === 'user') {
    if (chat.isSelf) return ['me'];
    return chat.isBot ? ['me'] : ['everyone', 'me'];
  }
  const rights = chat.adminRights;
  const isAdmin = chat.isCreator || rights?.deleteMessages === true;
  if (chat.chatType === 'group') return message.isOutgoing || isAdmin ? ['everyone', 'me'] : ['me'];
  if (chat.chatType === 'channel') {
    const canPost = message.isOutgoing && rights?.postMessages === true;
    return isAdmin || canPost ? ['everyone'] : [];
  }
  return message.isOutgoing || isAdmin ? ['everyone'] : [];
};
