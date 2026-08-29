// @ts-check
/** @type {typeof UiDialog.from} */
(dialog) => ({ ...dialog, lastMessage: UiDialog.preview(dialog.lastMessage) });
