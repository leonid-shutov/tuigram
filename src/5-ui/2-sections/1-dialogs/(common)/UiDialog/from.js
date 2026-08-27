/** @type {typeof UiDialog.from} */
(dialog) => ({
  ...dialog,
  lastMessage: dialog.lastMessage === null ? undefined : UiDialog.preview(dialog.lastMessage),
});
