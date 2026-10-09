/** @type {Actions['loadDialogsPreview']} */
() => {
  const chunkSize = 25;
  Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize))
    .then((dialogs) => store.dialogs.setAll(dialogs))
    .catch(ui.dialogs.settle);
};
