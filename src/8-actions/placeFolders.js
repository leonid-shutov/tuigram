// The folders to move between are the account's own and the archive, once it has a chat in it. The
// two load on their own, so each places the folders when it lands; the folder keys are only bound,
// and hinted, once there are folders to move between.
/** @type {Actions['placeFolders']} */
(folders) => {
  store.folders.setAll(Folder.withArchive(folders, store.dialogs.archived().length > 0));
  actions.repaintHints();
};
