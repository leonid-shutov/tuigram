// Runs on every `change` of store.dialogs or store.folders (10-subscriptions/store.js); called
// directly only to redraw for something outside the store, like a config reload.
/** @type {Actions['repaintDialogs']} */
() => {
  const folder = store.folders.selected;
  ui.dialogs.render(store.dialogs.inFolder(folder));
  // With no other folder to move to, there is no folder to name.
  if (store.folders.hasOthers) ui.dialogs.setFolder(Folder.title(folder));
  else ui.dialogs.clearFolder();
};
