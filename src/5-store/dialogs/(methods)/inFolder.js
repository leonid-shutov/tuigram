// "All chats" keeps the main list's own order, pins included; the archive is a list of its own;
// any other folder may reach into the archive, and orders itself.
/** @type {DialogsStoreSelf['inFolder']} */
(folder) => {
  if (folder.id === Folder.ALL.id) return self.all();
  if (folder.id === Folder.ARCHIVE.id) return self.archived();
  return Folder.view(folder, [...self.list, ...self.archive]);
};
