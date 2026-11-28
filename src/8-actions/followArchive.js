// The archive is a folder exactly while it has a chat: as its first page lands, and whenever it
// gains its first chat or loses its last. Only such a change places the folders again.
/** @type {Actions['followArchive']} */
() => {
  const shown = store.folders.list.some((folder) => folder.id === Folder.ARCHIVE.id);
  if (shown !== store.dialogs.hasArchived) actions.placeFolders(store.folders.list);
};
