// Telegram gives at most this many messages a request.
const MAX_PAGE = 100;

// Large enough to reach the unread divider, with the last message read above it, when one request
// can; past that the chat opens with the divider over its oldest message, and scrolling up moves
// the divider up as older unread pages land.
/** @type {Actions['loadFirstPage']} */
async (chatId) => {
  const unread = store.dialogs.find(chatId)?.unreadCount ?? 0;
  const limit = Math.min(MAX_PAGE, Math.max(config.history.firstPageSize, unread + 1));
  const page = await messenger.getPage(chatId, { limit });
  // the page is newest-first; the store takes it oldest-first
  const landed = store.chat.prepend(chatId, page.toReversed()) ?? [];
  for (const message of landed) actions.loadThumb(message);
  actions.loadReplies(landed);
};
