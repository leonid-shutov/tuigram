// A message that exists only on this client until the server confirms it. The store knows which
// chat it belongs to, so a pending message is a complete Message — `pending: true` is the only
// thing that sets it apart, and `confirm` swaps the whole object for the server's.
/** @type {typeof Message.pending} */
(text, chatId, chatName) => ({
  id: Random.id(),
  text,
  media: null,
  pending: true,
  sender: { id: null, isSelf: true, displayName: null },
  chatId,
  chatName,
  isGroup: false,
});
