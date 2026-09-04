/** @type {DialogsStore['set']} */
(dialogs) => {
  self.dialogs = LinkedDialogs.from(dialogs);
  self.emit('changed');
};
