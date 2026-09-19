process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');
process.on('uncaughtException', (error) => Crash.hard(error, 'uncaught exception'));
process.on('unhandledRejection', (reason) => Crash.hard(reason, 'unhandled rejection'));

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

Array.fromAsync(messenger.iterDialogs({ archived: true }))
  .then(store.dialogs.setArchived)
  .catch((error) => Crash.soft(error));
