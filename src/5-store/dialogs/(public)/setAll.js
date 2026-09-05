/** @type {DialogsStore['setAll']} */
(dialogs) => {
  self.list = LinkedDialogs.from(dialogs);
};
