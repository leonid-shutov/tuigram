ui[navigation.selected].focus();
actions.repaintHints();

const chunkSize = 10;
Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize))
  .then((dialogs) => {
    store.dialogs.setAll(dialogs);
    actions.repaintDialogs();
  })
  .catch(ui.dialogs.settle);

Array.fromAsync(messenger.iterDialogs())
  .then((dialogs) => {
    store.dialogs.setAll(dialogs);
    actions.repaintDialogs();
  })
  .finally(ui.dialogs.settle);

Array.fromAsync(messenger.iterDialogs({ archived: true })).then(store.dialogs.setArchived);
