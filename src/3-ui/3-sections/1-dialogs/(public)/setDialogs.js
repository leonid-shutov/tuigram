(dialogs) => {
  self.pinned = LinkedList.from(dialogs.filter((d) => d.isPinned));
  self.unpinned = LinkedList.from(dialogs.filter((d) => !d.isPinned));
  self.render();
};
