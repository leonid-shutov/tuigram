/** @type {Actions['loadFolders']} */
() => {
  messenger
    .getFolders()
    .then((folders) => {
      store.folders.setAll(Folder.withArchive(folders, store.dialogs.archived().length > 0));
      // The folder keys are only bound once there are folders to move between.
      actions.repaintHints();
    })
    .catch((error) => Crash.soft(error));
};
