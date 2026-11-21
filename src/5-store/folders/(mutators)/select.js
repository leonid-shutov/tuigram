Mutation(
  self,
  /** @type {FoldersStoreSelf['select']} */
  (folderId) => {
    if (self.list.some((/** @type {Folder} */ folder) => folder.id === folderId)) self.selectedId = folderId;
  },
);
