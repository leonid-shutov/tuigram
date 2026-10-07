// Same glyph and config flag as dialogs/(common)/Option/from.js.
/** @type {ChatSection['open']} */
(chatId, name) => {
  self.clear();
  self.component.setTitlePart('name', config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name);
};
