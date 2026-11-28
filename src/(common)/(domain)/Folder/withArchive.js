// The archive is a folder only once it has a chat in it: the official apps hide the way in when
// there is nothing behind it. It follows "All chats", wherever Telegram lists that one.
/** @type {typeof Folder.withArchive} */
(folders, archived) => {
  const list = folders.filter((folder) => folder.id !== Folder.ARCHIVE.id);
  if (!archived) return list;
  const all = list.findIndex((folder) => folder.id === Folder.ALL.id);
  return [...list.slice(0, all + 1), Folder.ARCHIVE, ...list.slice(all + 1)];
};
