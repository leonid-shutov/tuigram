/** @type {Actions['loadDialogsPreview']} */
() => {
  const chunkSize = 10;
  Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize))
    .then((dialogs) => {
      store.dialogs.setAll(dialogs);
      actions.repaintDialogs();
    })
    .catch(ui.dialogs.settle);
};
