(dialogs) => {
  self.archived = new Set(dialogs.map((dialog) => dialog.chatId));
};
