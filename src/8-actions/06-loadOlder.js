// The reentrancy latch lives in this file's lexical scope, not on `self`: loadOlder is its
// only reader, and both `up` and the prefetch in 6-ui can fire it while a page is in flight.
let loadingMore = false;

/** @type {Actions['loadOlder']} */
async () => {
  if (loadingMore || self.pager === undefined) return;
  loadingMore = true;
  const chatId = store.chat.chatId;
  try {
    const { value, done } = await self.pager.next();
    if (done || value === undefined || value.length === 0) return;
    // The chat may have been switched out from under the page request.
    if (store.chat.chatId !== chatId) return;

    // the pager yields newest-first; both halves take the batch oldest-first
    const older = value.toReversed();
    store.chat.prepend(older);
    ui.sections.chat.prepend(older);
  } finally {
    loadingMore = false;
  }
};
