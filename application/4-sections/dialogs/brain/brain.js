({
  dialogs: [],
  lastIndex: () => self.dialogs.length - 1,
  current: { index: -1, dialog: null },
  hasSelection: () => self.current.index !== -1,
  next: () => {
    if (self.current.index === self.lastIndex()) return self.current;
    const nextIndex = self.current.index + 1;
    return Object.assign(self.current, {
      index: nextIndex,
      dialog: self.dialogs[nextIndex],
    });
  },
  prev: () => {
    if (self.current.index === 0) return self.current;
    const prevIndex = self.current.index - 1;
    return Object.assign(self.current, {
      index: prevIndex,
      dialog: self.dialogs[prevIndex],
    });
  },
  addDialog: (dialog) => {
    self.dialogs.push(dialog);
  },
});
