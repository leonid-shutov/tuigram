// The first dialog per chat id, in order. A Set, not `includes`: the lists run to thousands.
/** @type {typeof Dialog.unique} */
(dialogs) => {
  const seen = new Set();
  return [...dialogs].filter((dialog) => !seen.has(dialog.chatId) && seen.add(dialog.chatId));
};
