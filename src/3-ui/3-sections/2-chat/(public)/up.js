async () => {
  if (self.selected === self.messages.head) await self.loadMore();
  if (self.selected === self.messages.head) return;
  self.selectMessage(self.selected.prev);

  // prefetch the next older page once the selection nears the top of the window
  if (self.messages.isNearHead(self.selected, 10)) self.loadMore();
};
