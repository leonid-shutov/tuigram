/** @type {DialogsSection['render']} */
(dialogs) => {
  self.chatIds = dialogs.map((dialog) => dialog.chatId);
  self.list.options = dialogs.map(Option.from);
};
