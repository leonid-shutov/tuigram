/** @type {typeof Message.pending} */
(text, media = [], replyTo = null) => ({
  id: Random.id(),
  text,
  entities: [],
  media,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId: undefined,
  chatName: undefined,
  isGroup: false,
  forwardedFrom: null,
  replyTo,
  date: new Date(),
  deleteScopes: [],
  reactions: [],
  partIds: [],
});
