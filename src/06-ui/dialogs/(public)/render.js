// Building a row measures its text, and a repaint follows every change to any dialog: only rows
// whose inputs changed are rebuilt. Rows of dialogs no longer listed are dropped with the map.
/** @type {DialogsSection['render']} */
(dialogs) => {
  const rows = dialogs.map((dialog) => {
    const key = Option.key(dialog);
    const held = self.rows.get(dialog.chatId) ?? null;
    const option = held === null || held.key !== key ? Option.from(dialog) : held.option;
    return { chatId: dialog.chatId, key, option };
  });
  self.rows = new Map(rows.map((row) => [row.chatId, row]));
  self.list.options = rows.map((row) => row.option);
};
