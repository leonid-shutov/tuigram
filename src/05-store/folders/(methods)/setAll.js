// A folder deleted while shown drops the pane back to "All chats".
/** @type {FoldersStore['setAll']} */
(folders) => {
  self.list = folders;
  if (!folders.some((/** @type {Folder} */ folder) => folder.id === self.selectedId)) self.selectedId = Folder.ALL.id;
};
