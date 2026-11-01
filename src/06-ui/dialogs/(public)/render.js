// Building a row measures its text, and a repaint follows every change to any dialog: only rows
// whose inputs changed are rebuilt. Rows of dialogs no longer listed are dropped with the map.
/** @type {DialogsSection['render']} */
(dialogs) => {
  const selected = self.selectedChatId;
  const rows = dialogs.map((dialog) => {
    const { chatId } = dialog;
    const glyph = config.dialogEmoji ? Emoji.of(chatId, config.emojis.get(chatId) ?? null) : null;
    const key = Option.key(dialog, glyph);
    const held = self.rows.get(chatId) ?? null;
    const option = held === null || held.key !== key ? Option.from(dialog, glyph) : held.option;
    return { chatId, key, option };
  });
  self.rows = new Map(rows.map((row) => [row.chatId, row]));
  self.list.options = rows.map((row) => row.option);
  if (selected !== null) self.select(selected);
};
