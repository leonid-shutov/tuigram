/** @type {DialogsStore['setArchived']} */
(dialogs) => void (self.archived = new Set(dialogs.map((dialog) => dialog.chatId)));
