/** @type {Actions['loadFolders']} */
() => {
  messenger
    .getFolders()
    .then((folders) => {
      store.folders.setAll(folders);
      // The folder keys are only bound once there are folders to move between.
      actions.repaintHints();
    })
    .catch((error) => Crash.soft(error));
};
