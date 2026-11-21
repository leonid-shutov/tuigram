/** @type {Actions['searchChats']} */
() => {
  ui.picker.open({
    title: ` ${Locale.t(keymap.commands.app['app.search'].title)} `,
    placeholder: Locale.t('Search chats…'),
    items: store.dialogs.all().map(Dialog.toPickerItem),
    onPick: actions.openChat,
  });
  navigation.select('picker');
};
