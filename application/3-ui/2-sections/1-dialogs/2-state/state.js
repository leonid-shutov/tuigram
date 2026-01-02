({
  SCROLLOFF: 1,

  // new dialogs are being loaded
  loading: false,

  startLoading() {
    if (self.loading) return;
    self.addDialog({
      loading: true,
      name: 'Loading...',
      lastMessage: 'Loading...',
    });
    self.loading = true;
  },

  stopLoading() {
    if (!self.loading) return;
    self.dialogs.pop();
    self.loading = false;
  },

  selected: null,

  isLastSelected() {
    return self.selected.index === self.dialogs.at(-1).index;
  },

  opened: null,

  window: { start: 0, end: $.ui.maxDialogs - 1 },

  dialogs: [],

  getDialogs() {
    const dialogs = self.dialogs.slice(self.window.start, self.window.end + 1);
    return dialogs.map((dialog) => ({
      ...dialog,
      selected: self.selected !== null && dialog.index === self.selected.index,
      opened: self.opened !== null && dialog.index === self.opened.index,
      isLast: self.window.end === dialog.index,
    }));
  },

  addDialog(dialog) {
    self.dialogs.push({ ...dialog, index: self.dialogs.length });
    if (self.dialogs.length === 1) self.selected = self.dialogs[0];
  },

  uploadDialogs(dialogs) {
    self.stopLoading();
    for (const dialog of dialogs) self.addDialog(dialog);
  },

  _isFirstWindow() {
    return self.window.start === 0;
  },

  _isLastWindow() {
    return self.window.end === self.dialogs.length - 1;
  },

  _nextWindow() {
    if (self._isLastWindow()) return;
    self.window = { start: self.window.start + 1, end: self.window.end + 1 };
  },

  _prevWindow() {
    if (self._isFirstWindow()) return;
    self.window = { start: self.window.start - 1, end: self.window.end - 1 };
  },

  next() {
    if (self.isLastSelected()) return self.getDialogs();
    const nextDialog = self.dialogs[self.selected.index + 1];
    const remainder = self.window.end - nextDialog.index;
    const shouldScroll = remainder === self.SCROLLOFF - 1 || remainder === -1;
    if (shouldScroll) self._nextWindow();
    self.selected = nextDialog;
    return self.getDialogs();
  },

  prev() {
    const prevDialog = self.dialogs[self.selected.index - 1];
    if (prevDialog === undefined) return [];
    const remainder = prevDialog.index - self.window.start;
    const shouldScroll = remainder === self.SCROLLOFF - 1;
    if (shouldScroll) self._prevWindow();
    self.selected = prevDialog;
    return self.getDialogs();
  },

  open() {
    self.opened = self.selected;
    return self.getDialogs();
  },
});
