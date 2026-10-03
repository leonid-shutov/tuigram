/** @type {typeof Folder.view} */
(folder, dialogs) => {
  const matching = [...dialogs].filter((dialog) => Folder.includes(folder, dialog));

  // A folder pins on its own; a chat pinned in the main list is just another chat here.
  const pinned = folder.pinnedIds
    .map((chatId) => matching.find((dialog) => dialog.chatId === chatId))
    .filter((dialog) => dialog !== undefined);
  const rest = matching
    .filter((dialog) => !folder.pinnedIds.includes(dialog.chatId))
    .sort((a, b) => b.activity - a.activity);
  return [...pinned, ...rest];
};
