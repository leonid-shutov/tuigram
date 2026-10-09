/** @type {Actions['loadDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs())
    .then((dialogs) => store.dialogs.setAll(dialogs))
    .finally(ui.dialogs.settle);
};
