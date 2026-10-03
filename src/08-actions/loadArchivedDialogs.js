/** @type {Actions['loadArchivedDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs({ archived: true }))
    .then((dialogs) => {
      store.dialogs.setArchived(dialogs);
      actions.repaintDialogs();
    })
    .catch((error) => Crash.soft(error));
};
