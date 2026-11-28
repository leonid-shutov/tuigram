/** @type {Actions['searchChats']} */
() => {
  ui.picker.open({
    title: ` ${Locale.t(keymap.commands.app['app.search'].title)} `,
    placeholder: Locale.t('Search chats…'),
    // The archive is a folder in the list, not a place apart: its chats are worth finding too.
    items: [...store.dialogs.all(), ...store.dialogs.archived()].map(Dialog.toPickerItem),
    onPick: (chatId) => {
      // A found chat may have no row in the folder on screen: an archived one, or one the folder
      // leaves out. Show the list it lives in first, so the selection lands on its row.
      if (!store.dialogs.inFolder(store.folders.selected).some((dialog) => dialog.chatId === chatId)) {
        store.folders.select(store.dialogs.isArchived(chatId) ? Folder.ARCHIVE.id : Folder.ALL.id);
      }
      void actions.openChat(chatId);
    },
  });
  navigation.select('picker');
};
