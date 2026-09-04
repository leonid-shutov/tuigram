/** @type {ChatSelf['down']} */
() => {
  if (store.chat.isNewest(self.selectedId)) return;
  self.selectMessage(store.chat.next(self.selectedId));
};
