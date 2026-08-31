/** @type {DialogsSelf['setDialogs']} */
(dialogs) => {
  self.dialogs = LinkedDialogs.from(dialogs.map(UiDialog.from));
  self.render();
};
