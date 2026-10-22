// A fetched list can predate read marks that streamed in while it was paging: a mark only moves up.
/** @type {DialogsStoreSelf['link']} */
(dialogs) => {
  for (const dialog of dialogs) {
    const known = self.find(dialog.chatId);
    if (known !== null) dialog.readUpTo = Math.max(dialog.readUpTo, known.readUpTo);
  }
  return LinkedDialogs.from(dialogs);
};
