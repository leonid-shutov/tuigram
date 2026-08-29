// @ts-check
/** @type {typeof UiDialog.toOption} */
({ chatId, name, lastMessage, unreadCount = 0, isUnread = false, isMuted = false }) => {
  const shouldShowDot = (unreadCount > 0 || isUnread) && !isMuted;
  // Inner text width of the dialogs list: wrapper box is config.theme.panelWidth in
  // 2-component.js, minus borders and left/right gaps.
  const width = config.theme.panelWidth - 4;
  const nameWithDot = `${name.slice(0, width - 2).padEnd(width - 2)} ●`;
  const description = lastMessage === undefined ? '' : `${lastMessage.slice(0, width - 2)} `;
  return { chatId, name: shouldShowDot ? nameWithDot : name, description };
};
