// `select` and `setAll` keep `selectedId` in the list; the fallback only satisfies `find`.
/** @type {() => FoldersStoreSelf['selected']} */
() => self.list.find((/** @type {Folder} */ folder) => folder.id === self.selectedId) ?? Folder.ALL;
