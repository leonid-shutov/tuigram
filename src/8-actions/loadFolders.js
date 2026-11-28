/** @type {Actions['loadFolders']} */
() => {
  messenger
    .getFolders()
    .then(actions.placeFolders)
    .catch((error) => Crash.soft(error));
};
