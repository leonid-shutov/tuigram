/** @type {Actions['searchChats']} */
() => {
  ui.picker.open({
    title: ` ${keymap.commands.app['app.search'].title} `,
    placeholder: 'Search chats…',
    items: store.dialogs.all().map(Dialog.toPickerItem),
    onPick: actions.openChat,
  });
  navigation.select('picker');
};
