// Three passes, deliberately racing: the first ten dialogs land almost immediately so the list
// is never empty on screen, the full list replaces them when it finishes, and the archive set
// arrives whenever it does. Each `set` re-emits `changed`, so the UI just re-renders.
/** @type {DialogsStore['load']} */
async () => {
  const chunkSize = 10;
  await Promise.all([
    Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize)).then(self.set),
    Array.fromAsync(messenger.iterDialogs()).then(self.set),
    Array.fromAsync(messenger.iterDialogs({ archived: true })).then(self.setArchived),
  ]);
};
