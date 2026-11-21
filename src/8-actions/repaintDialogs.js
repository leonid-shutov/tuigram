// Runs on every `change` of store.dialogs or store.folders (10-subscriptions/store.js); called
// directly only to redraw for something outside the store, like a config reload.
/** @type {Actions['repaintDialogs']} */
() => {
  const folder = store.folders.selected;
  ui.dialogs.render(store.dialogs.inFolder(folder));
  // Without folders of its own, the account has no folder to name.
  if (store.folders.hasCustom) ui.dialogs.setFolder(folder.title);
  else ui.dialogs.clearFolder();
};
