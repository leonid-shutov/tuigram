// Same glyph and config flag as dialogs/(common)/Option/from.js.
/** @type {ChatSection['paintName']} */
(chatId, name) => self.component.setTitlePart('name', config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name);
