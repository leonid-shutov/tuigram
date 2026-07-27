async () => {
  if (self.selected === self.messages.head) await self.loadMore();
  if (self.selected === self.messages.head) return;
  self.selectMessage(self.selected.prev);

  // prefetch the next older page once the selection nears the top of the window
  let node = self.selected;
  for (let i = 0; i < 10; i++) {
    if (node === self.messages.head) return void self.loadMore();
    node = node.prev;
  }
};
