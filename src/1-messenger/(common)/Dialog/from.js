// mtcute's Dialog.isMuted ignores the muteUntil timestamp until 0.31.0+ ships
// the fix (mtcute@0571018), so compute it here and drop this on the next bump.
const isMutedOf = ({ silent, muteUntil }) => {
  if (muteUntil !== undefined) return muteUntil > Date.now() / 1000;
  return silent ?? null;
};

({ peer, lastMessage, isPinned, unreadCount, isUnread, raw }) => ({
  chatId: lastMessage.chat.id,
  name: peer.displayName,
  lastMessage: Message.from(lastMessage),
  isPinned,
  unreadCount,
  isUnread,
  isMuted: isMutedOf(raw.notifySettings),
});
