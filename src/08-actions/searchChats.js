/** @type {Actions['searchChats']} */
() => {
  ui.picker.open({
    title: ` ${keymap.commands.app['app.search'].title} `,
    placeholder: 'Search chats…',
    items: store.dialogs.all().map((dialog) => ({
      name: dialog.name,
      description: Message.preview(dialog.lastMessage) ?? '',
      value: dialog.chatId,
    })),
    onPick: actions.openChat,
  });
  navigation.select('picker');
};
