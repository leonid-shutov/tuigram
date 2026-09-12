// Same glyph and config flag as dialogs/(common)/Option/from.js.
/** @type {ChatSection['setHeader']} */
(chatId, name) => void (self.header.content = config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name);
