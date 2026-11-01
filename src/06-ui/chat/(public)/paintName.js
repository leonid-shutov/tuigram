// Same glyph and config flag as dialogs/(public)/render.js.
/** @type {ChatSection['paintName']} */
(chatId, name) => {
  const glyph = config.dialogEmoji ? `${Emoji.of(chatId, config.emojis.get(chatId) ?? null)} ` : '';
  self.component.setTitlePart('name', `${glyph}${name}`);
};
