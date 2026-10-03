/** @type {Actions['stepFolder']} */
(step) => {
  store.folders.step(step);
  actions.repaintDialogs();
  // Back to the top of the new folder, unless the open chat is in it.
  ui.dialogs.first();
  if (store.chat.chatId !== null) ui.dialogs.select(store.chat.chatId);
};
