/** @type {Actions['preloadChats']} */
async () => {
  const top = store.dialogs.all().slice(0, config.history.maxCachedChats);
  for (const { chatId } of top.toReversed()) store.chat.cache(chatId);
  for (const { chatId } of top) {
    // Opened meanwhile, or evicted by a chat opened since: nothing to fill.
    if (!store.chat.needsFirstPage(chatId)) continue;
    const loaded = await Result.fromPromise(actions.loadFirstPage(chatId));
    if (loaded.ok) continue;
    Crash.soft(loaded.error);
    if (messenger.isFloodWait(loaded.error)) return;
  }
};
