/** @type {Actions['loadDialogs']} */
() => {
  Array.fromAsync(messenger.iterDialogs())
    .then((dialogs) => {
      store.dialogs.setAll(dialogs);
      actions.repaintDialogs();
    })
    .finally(ui.dialogs.settle);
};
