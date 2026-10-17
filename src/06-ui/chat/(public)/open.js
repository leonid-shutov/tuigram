// Same glyph and config flag as dialogs/(common)/Option/from.js.
/** @type {ChatSection['open']} */
(chatId, name) => {
  self.render({ messages: [], receipt: null, presence: null });
  self.spinner.stop();
  self.component.clearTitlePart('status');
  self.component.setTitlePart('name', config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name);
};
