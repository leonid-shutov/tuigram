/** @type {ChatStoreSelf['trim']} */
(chat) => {
  const firstPageSize = config.history.firstPageSize;
  if (chat.messages.length > firstPageSize) chat.messages = chat.messages.slice(-firstPageSize);
};
