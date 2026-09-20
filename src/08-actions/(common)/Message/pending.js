/** @type {typeof Message.pending} */
(text, media = null) => ({
  id: Random.id(),
  text,
  media,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId: undefined,
  chatName: undefined,
  isGroup: false,
});
