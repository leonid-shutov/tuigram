/** @type {Actions['loadFirstPage']} */
async (chatId) => {
  const page = await messenger.getPage(chatId);
  // the page is newest-first; the store takes it oldest-first
  const landed = store.chat.prepend(chatId, page.toReversed()) ?? [];
  for (const message of landed) actions.loadThumb(message);
  actions.loadReplies(landed);
};
