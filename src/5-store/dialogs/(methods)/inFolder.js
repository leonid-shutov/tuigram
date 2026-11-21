// "All chats" keeps the main list's own order, pins included; any other folder may reach into
// the archive, and orders itself.
/** @type {DialogsStoreSelf['inFolder']} */
(folder) => {
  if (folder.id === Folder.ALL.id) return self.all();
  return Folder.view(folder, [...self.list, ...self.archive]);
};
