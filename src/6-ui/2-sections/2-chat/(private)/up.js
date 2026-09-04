/** @type {ChatSelf['up']} */
async () => {
  if (self.selectedMessage === self.messages.head) await self.loadMore();
  if (self.selectedMessage === self.messages.head) return;
  self.selectMessage(self.selectedMessage?.prev ?? null);

  // prefetch the next older page once the selection nears the top of the window
  if (self.selectedMessage !== null && self.messages.isNearHead(self.selectedMessage, 10)) self.loadMore();
};
