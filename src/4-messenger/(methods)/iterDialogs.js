// Telegram hoists pinned dialogs to the head of the first page AND returns them again in their
// date-ordered slot; when that slot lands on a later page nothing dedupes it, so the same chat
// arrives twice. mtcute's `pinned` option can't help — 'exclude' drops pinned chats entirely and
// 'keep' is folder-only — so the guard belongs here: the messenger yields each chat at most once.
(() =>
  /** @type {MessengerModule['iterDialogs']} */
  async function* ({ chunkSize, archived = false } = {}) {
    const seen = new Set();
    const source = messenger.tg.iterDialogs({ chunkSize, archived: archived ? 'only' : 'exclude' });
    for await (const dialog of source) {
      if (seen.has(dialog.peer.id)) continue;
      seen.add(dialog.peer.id);
      yield Dialog.from(dialog);
    }
  })();
