() => {
  self.messages = LinkedList.from([]);
  for (const child of self.component.getChildren()) child.destroy();
};
