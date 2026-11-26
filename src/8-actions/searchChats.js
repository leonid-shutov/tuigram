/** @type {Actions['searchChats']} */
() => {
  ui.picker.open({
    title: ` ${Locale.t(keymap.commands.app['app.search'].title)} `,
    placeholder: Locale.t('Search chats…'),
    // The archive is a folder in the list, not a place apart: its chats are worth finding too.
    items: [...store.dialogs.all(), ...store.dialogs.archived()].map(Dialog.toPickerItem),
    onPick: actions.openChat,
  });
  navigation.select('picker');
};
