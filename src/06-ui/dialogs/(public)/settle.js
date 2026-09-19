/** @type {DialogsSection['settle']} */
(error) => {
  if (!self.loading) return;
  self.loading = false;
  node.timers.clearInterval(self.spinner);
  if (error !== undefined) {
    Crash.soft(error);
    self.component.bottomTitle = ' couldn’t load chats ';
  } else self.component.bottomTitle = undefined;
};
