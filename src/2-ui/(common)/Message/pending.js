(text) => ({
  id: Random.uuid(),
  text,
  media: null,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId: null,
  chatName: null,
  isGroup: false,
});
