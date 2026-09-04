// The archive is a membership set, not a list: nothing renders it, `isArchived` only filters
// incoming messages with it.
/** @type {DialogsStore['setArchived']} */
(dialogs) => {
  self.archived = new Set(dialogs.map((dialog) => dialog.chatId));
};
