// The reentrancy latch lives in this file's lexical scope, not on the module: loadOlder is its
// only reader, and both `up` and the prefetch in 6-ui can fire it while a page is in flight.
let loadingMore = false;

/** @type {Actions['loadOlder']} */
async () => {
  const pager = store.chat.pager;
  if (loadingMore || pager === null) return;
  loadingMore = true;
  const chatId = store.chat.chatId;

  const paged = await Result.fromPromise(pager.next());
  loadingMore = false;
  if (!paged.ok) return void ui.errors.report('Could not load older messages.', paged.error);

  const { value, done } = paged.unwrap();
  if (done || value === undefined || value.length === 0) return;
  if (store.chat.chatId !== chatId) return;

  // the pager yields newest-first; both halves take the batch oldest-first
  const older = value.toReversed();
  store.chat.prepend(older);
  ui.chat.prepend(older);
  for (const message of older) actions.loadThumb(message);
};
