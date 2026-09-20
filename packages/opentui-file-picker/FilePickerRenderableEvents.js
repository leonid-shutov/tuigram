/** @enum {string} */
export const FilePickerRenderableEvents = {
  /** A file was chosen. Payload: its absolute path. The renderable does not hide itself. */
  SELECT: 'select',
  /** The user asked to leave without picking anything. */
  CANCEL: 'cancel',
  /** The browsed directory changed. Payload: the new absolute path. */
  DIRECTORY_CHANGED: 'directoryChanged',
  /** The highlighted row changed. Payload: (index, entry). */
  SELECTION_CHANGED: 'selectionChanged',
  /** Entered or left filter-editing mode. Payload: whether filtering is now active. */
  MODE_CHANGED: 'modeChanged',
  /** A `readdir`/`stat` failed. Payload: the raw error. The last-good listing is kept on screen. */
  ERROR: 'error',
};
