/** @type {Actions['loadDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs())
    .then((dialogs) => store.dialogs.setAll(dialogs))
    .catch((error) => Crash.soft(error))
    .finally(ui.dialogs.settle);
};
