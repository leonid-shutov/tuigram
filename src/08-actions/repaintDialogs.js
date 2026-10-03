// The funnel: every mutation of store.dialogs or store.folders must be followed by this.
/** @type {Actions['repaintDialogs']} */
() => {
  const folder = store.folders.selected;
  ui.dialogs.render(store.dialogs.inFolder(folder));
  // Without folders of its own, the account has no folder to name.
  if (store.folders.hasCustom) ui.dialogs.setFolder(folder.title);
  else ui.dialogs.clearFolder();
};
