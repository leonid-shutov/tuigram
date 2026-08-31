/** @type {typeof Message.pending} */
(text) => ({
  id: Random.id(),
  text,
  media: null,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId: undefined,
  chatName: undefined,
  isGroup: false,
});
