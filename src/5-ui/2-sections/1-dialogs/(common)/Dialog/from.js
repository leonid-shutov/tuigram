// @ts-check
/**
 * @param {import('../../../../../../types/domain').MessengerDialog} dialog
 * @returns {import('../../../../../../types/domain').UiDialog}
 */
(dialog) => ({ ...dialog, lastMessage: Dialog.preview(dialog.lastMessage) });
