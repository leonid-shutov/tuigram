/** @type {ChatSelf['up']} */
async () => {
  if (store.chat.isOldest(self.selectedId)) await store.chat.loadOlder();
  if (store.chat.isOldest(self.selectedId)) return;
  self.selectMessage(store.chat.prev(self.selectedId));

  // prefetch the next older page once the selection nears the top of the window
  if (self.selectedId !== null && store.chat.isNearOldest(self.selectedId, 10)) store.chat.loadOlder();
};
