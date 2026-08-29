// @ts-check
// mtcute's Dialog.isMuted ignores the muteUntil timestamp until 0.31.0+ ships
// the fix (mtcute@0571018), so compute it here and drop this on the next bump.
/** @param {{ silent?: boolean, muteUntil?: number }} settings */
const isMutedOf = ({ silent, muteUntil }) => {
  if (muteUntil !== undefined) return muteUntil > Date.now() / 1000;
  return silent ?? null;
};

/** @type {typeof Dialog.from} */
({ peer, lastMessage, isPinned, unreadCount, isUnread, raw }) => ({
  chatId: peer.id,
  name: peer.displayName,
  lastMessage: lastMessage && Message.from(lastMessage),
  isPinned,
  unreadCount,
  isUnread,
  isMuted: isMutedOf(raw.notifySettings),
});
