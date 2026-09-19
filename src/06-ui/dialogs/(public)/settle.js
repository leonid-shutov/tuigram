/** @type {DialogsSection['settle']} */
(error) => {
  if (!self.loading) return;
  self.loading = false;
  node.timers.clearInterval(self.spinner);
  if (error !== undefined) {
    self.component.bottomTitle = ' couldn’t load chats ';
    ui.errors.report('Could not load your chats.', error);
  } else self.component.bottomTitle = undefined;
};
