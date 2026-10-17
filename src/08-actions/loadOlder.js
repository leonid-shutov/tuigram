// The reentrancy latch lives in this file's lexical scope, not on the module: loadOlder is its
// only reader, and both `up` and the prefetch in 6-ui can fire it while a page is in flight.
let loadingMore = false;
// Chat id to the id of the chat's very first message, learned when Telegram had nothing older to
// give. Without it, every keypress near the top of a chat read back to its start would ask again.
/** @type {Map<number, number>} */
const firstMessageIds = new Map();

/** @type {Actions['loadOlder']} */
async () => {
  const chatId = store.chat.openChatId;
  if (loadingMore || chatId === null) return;
  const oldest = store.chat.oldestConfirmed(chatId);
  // Nothing loaded yet: the chat's newest page is still on its way.
  if (oldest === null) return;
  // The chat's first message is loaded already: there is nothing older.
  if (firstMessageIds.get(chatId) === oldest.id) return;
  loadingMore = true;

  const spinner = ui.chat.spin();
  const paged = await Result.fromPromise(messenger.getPage(chatId, { before: oldest }));
  spinner.stop();
  loadingMore = false;
  if (!paged.ok) return void ui.errors.report('Could not load older messages.', paged.error);

  const page = paged.unwrap();
  if (page.length === 0) return void firstMessageIds.set(chatId, oldest.id);
  // The chat was left and trimmed meanwhile, or its oldest message was deleted: the page belongs
  // under a message the chat no longer has, and would land below a gap.
  const isStillOldest = store.chat.oldestConfirmed(chatId)?.id === oldest.id;
  if (!isStillOldest) return;

  // the page is newest-first; the store takes it oldest-first
  const landed = store.chat.prepend(chatId, page.toReversed()) ?? [];
  for (const message of landed) actions.loadThumb(message);
  actions.loadReplies(landed);
};
