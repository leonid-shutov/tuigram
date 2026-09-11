/** @type {DialogsSection['settle']} */
(error) => {
  if (!self.loading) return;
  self.loading = false;
  node.timers.clearInterval(self.spinner);
  if (error instanceof Error) {
    console.log(`Failed to load dialogs: ${error.stack}`);
    self.component.bottomTitle = ' couldn’t load chats ';
  } else self.component.bottomTitle = undefined;
};
