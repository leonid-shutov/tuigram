/** @type {typeof UiDialog.toOption} */
({ chatId, name, lastMessage, unreadCount = 0, isUnread = false, isMuted = false }) => {
  const shouldShowDot = (unreadCount > 0 || isUnread) && !isMuted;
  // Inner text width of the dialogs list: wrapper box is config.theme.panelWidth in
  // 2-component.js, minus borders and left/right gaps.
  const width = config.theme.panelWidth - 4;
  const gutter = config.dialogEmoji ? `${Emoji.fromHash(chatId)} ` : '';
  const nameWidth = width - gutter.length;
  const nameWithDot = `${gutter}${name.slice(0, nameWidth - 2).padEnd(nameWidth - 2)} ●`;
  const description =
    lastMessage === undefined ? '' : `${' '.repeat(gutter.length)}${lastMessage.slice(0, nameWidth - 2)} `;
  return { chatId, name: shouldShowDot ? nameWithDot : `${gutter}${name}`, description };
};
