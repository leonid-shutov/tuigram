/** @type {Actions['loadArchivedDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs({ archived: true }))
    .then((dialogs) => store.dialogs.setArchived(dialogs))
    .catch((error) => Crash.soft(error));
};
