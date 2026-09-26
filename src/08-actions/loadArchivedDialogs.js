/** @type {Actions['loadArchivedDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs({ archived: true }))
    .then(store.dialogs.setArchived)
    .catch((error) => Crash.soft(error));
};
