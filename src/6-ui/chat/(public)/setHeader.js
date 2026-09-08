// Same glyph the dialogs row draws for this peer, behind the same config flag — see
// dialogs/(common)/Option/from.js.
/** @type {ChatSection['setHeader']} */
(chatId, name) => void (self.header.content = config.dialogEmoji ? `${Emoji.fromHash(chatId)} ${name}` : name);
