({
  dialogs: [],
  lastIndex: () => self.dialogs.length - 1,
  currentSelection: { index: -1, dialog: null },
  hasSelection: () => self.currentSelection.index !== -1,
  next: () => {
    if (self.currentSelection.index === self.lastIndex()) {
      return self.currentSelection;
    }
    const nextIndex = self.currentSelection.index + 1;
    self.currentSelection = {
      index: nextIndex,
      dialog: self.dialogs[nextIndex],
    };
    return self.currentSelection;
  },
  prev: () => {
    if (self.currentSelection.index === 0) return self.currentSelection;
    const prevIndex = self.currentSelection.index - 1;
    self.currentSelection = {
      index: prevIndex,
      dialog: self.dialogs[prevIndex],
    };
    return self.currentSelection;
  },
  currentOpened: { index: undefined, dialog: null },
  open: () => {
    self.currentOpened = self.currentSelection;
    return self.currentOpened;
  },
  addDialog: (dialog) => {
    self.dialogs.push(dialog);
  },
});
