({
  SCROLLOFF: 2,
  //windowSize: module.ui.getMaxDialogs(),

  dialogs: [],
  window: { start: 0, end: module.ui.getMaxDialogs() - 1 },
  selected: 0,
  opened: undefined,

  addDialog(dialog) {
    self.dialogs.push({ ...dialog, index: self.dialogs.length });
  },

  _nextWindow() {
    const isLastWindow = self.window.end === self.dialogs.length - 1;
    if (isLastWindow) return;
    self.window = { start: self.window.start + 1, end: self.window.end + 1 };
  },

  _prevWindow() {
    const isFirstWindow = self.window.start === 0;
    if (isFirstWindow) return;
    self.window = { start: self.window.start - 1, end: self.window.end - 1 };
  },

  next() {
    const nextSelected = self.selected + 1;
    if (nextSelected === self.dialogs.length) return;
    const isEdge = self.window.end - nextSelected === self.SCROLLOFF - 1;
    if (isEdge) self._nextWindow();
    self.selected = nextSelected;
    return self.getDialogs();
  },

  prev() {
    const prevSelected = self.selected - 1;
    if (prevSelected === -1) return;
    const isEdge = prevSelected - self.window.start === self.SCROLLOFF - 1;
    if (isEdge) self._prevWindow();
    self.selected = prevSelected;
    return self.getDialogs();
  },

  open() {
    self.opened = self.selected;
    return self.getDialogs();
  },

  getDialogs() {
    const dialogs = self.dialogs.slice(self.window.start, self.window.end + 1);
    return dialogs.map((dialog) => ({
      ...dialog,
      selected: dialog.index === self.selected,
      opened: dialog.index === self.opened,
    }));
  },
});
