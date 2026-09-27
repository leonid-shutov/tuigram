// Same glyph and config flag as dialogs/(common)/Option/from.js.
/** @type {ChatSection['setHeader']} */
(chatId, name) => {
  self.headerName.content = config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name;
  self.headerPresence.content = '';
};
