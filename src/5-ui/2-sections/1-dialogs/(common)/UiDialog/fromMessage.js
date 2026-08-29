// @ts-check
/**
 * @param {import('../../../../../../types/domain').AppMessage} message
 * @param {number} [unreadCount]
 * @returns {import('../../../../../../types/domain').UiDialog}
 */
(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName,
  lastMessage: UiDialog.preview(message),
  unreadCount,
});
