const { FilePickerRenderableEvents } = npm['@leonid-shutov/opentui-file-picker'];

const list = FilePicker({
  id: 'filePickerList',
  flexGrow: 1,
  startDirectory: node.os.homedir(),
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.bg,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  directoryColor: config.theme.accentAlt,
  fileColor: config.theme.fg,
  descriptionColor: config.theme.muted,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.fg,
  errorColor: config.theme.danger,
});

// Forwarded, not re-emitted under the same names: this section's own `select`/`error` are its
// public intent, kept separate from the renderable's internal event enum.
list.on(FilePickerRenderableEvents.SELECT, (/** @type {string} */ filePath) => self.emit('select', filePath));
list.on(FilePickerRenderableEvents.MODE_CHANGED, () => self.emit('mode'));
list.on(FilePickerRenderableEvents.ERROR, (/** @type {unknown} */ error) => self.emit('error', error));

list;
