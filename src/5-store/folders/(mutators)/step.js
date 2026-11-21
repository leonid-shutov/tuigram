Mutation(
  self,
  /** @type {FoldersStoreSelf['step']} */
  (step) => {
    const { length } = self.list;
    const index = self.list.findIndex((/** @type {Folder} */ folder) => folder.id === self.selectedId);
    self.selectedId = self.list[(((index + step) % length) + length) % length].id;
  },
);
