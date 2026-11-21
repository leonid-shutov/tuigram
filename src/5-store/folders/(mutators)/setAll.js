// A folder deleted while shown drops the pane back to "All chats".
Mutation(
  self,
  /** @type {FoldersStoreSelf['setAll']} */
  (folders) => {
    self.list = folders;
    if (!folders.some((/** @type {Folder} */ folder) => folder.id === self.selectedId)) self.selectedId = Folder.ALL.id;
  },
);
