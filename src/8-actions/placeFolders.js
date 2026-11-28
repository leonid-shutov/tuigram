// The folders to move between are the account's own and the archive, while it has a chat in it. The
// folder keys are only bound, and hinted, once there are folders to move between.
/** @type {Actions['placeFolders']} */
(folders) => {
  store.folders.setAll(Folder.withArchive(folders, store.dialogs.hasArchived));
  actions.repaintHints();
};
