// mtcute's Dialog.isMuted ignores the muteUntil timestamp until 0.31.0+ ships
// the fix (mtcute@0571018), so compute it here and drop this on the next bump.
/** @param {{ silent?: boolean, muteUntil?: number }} settings */
const isMutedOf = ({ silent, muteUntil }) => {
  if (muteUntil !== undefined) return muteUntil > Date.now() / 1000;
  return silent ?? null;
};

// The same split mtcute's Dialog.filterFolder draws, so a folder's rules classify chats alike.
/** @param {import('@mtcute/node').Peer} peer @returns {Dialog['kind']} */
const kindOf = (peer) => {
  if (peer.type === 'user') return peer.isBot ? 'bot' : 'user';
  if (peer.isGroup) return 'group';
  return peer.chatType === 'channel' ? 'channel' : 'other';
};

/** @type {MessengerSelf['toDialog']} */
({ peer, lastMessage, isPinned, isArchived, unreadCount, isUnread, raw }) => ({
  chatId: peer.id,
  name: peer.displayName,
  lastMessage: lastMessage && self.toMessage(lastMessage),
  isPinned,
  unreadCount,
  isUnread,
  isMuted: isMutedOf(raw.notifySettings),
  isUser: peer.type === 'user' && !peer.isSelf,
  kind: kindOf(peer),
  isContact: peer.type === 'user' && peer.isContact,
  isArchived,
  activity: lastMessage?.date.getTime() ?? 0,
});
