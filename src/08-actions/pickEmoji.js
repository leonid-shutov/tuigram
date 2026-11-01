/** @type {Actions['pickEmoji']} */
() => {
  const chatId = ui.dialogs.selectedChatId;
  if (chatId === null) return;
  const current = config.emojis.get(chatId) ?? '';
  /** @param {string} glyph @param {string} name @param {string} value */
  const item = (glyph, name, value) => {
    const suffix = value === current ? ' · current' : '';
    return { name: `${glyph} ${name}${suffix}`, description: '', value };
  };
  ui.picker.open({
    title: ` ${keymap.commands.dialogs['dialogs.emoji'].title} `,
    placeholder: 'Search emoji…',
    pickHint: 'Set',
    items: [
      item(Emoji.fromHash(chatId), 'default', ''),
      ...Emoji.catalog.map(({ glyph, name }) => item(glyph, name, glyph)),
    ],
    /** @param {string} value */
    onPick: (value) => {
      const saved = config.setEmoji(chatId, value === '' ? null : value);
      actions.repaintDialogs();
      actions.repaintChatTitle();
      navigation.select('dialogs');
      void saved.catch((error) => ui.errors.report('Could not save the chat emoji.', error));
    },
  });
  navigation.select('picker');
};
