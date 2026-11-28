// "All chats" and the archive are ours to name, so their titles follow the interface language. A
// folder the user made keeps their own text, in whatever language they wrote it.
/** @type {typeof Folder.title} */
(folder) => {
  if (folder.id === Folder.ALL.id) return Locale.t('All chats');
  if (folder.id === Folder.ARCHIVE.id) return Locale.t('Archived chats');
  return folder.title;
};
