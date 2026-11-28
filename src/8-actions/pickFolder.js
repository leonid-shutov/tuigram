/** @type {Actions['pickFolder']} */
() => {
  ui.picker.open({
    title: ` ${Locale.t(keymap.commands.folders['folders.pick'].title)} `,
    placeholder: Locale.t('Search folders…'),
    items: store.folders.list.map((folder) => ({ name: Folder.title(folder), description: '', value: folder.id })),
    onPick: actions.openFolder,
  });
  navigation.select('picker');
};
