(dialogs) => {
  self.dialogs = LinkedDialogs.from(dialogs.map(Dialog.from));
  self.render();
};
