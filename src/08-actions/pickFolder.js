/** @type {Actions['pickFolder']} */
() => {
  ui.picker.open({
    title: ` ${keymap.commands.folders['folders.pick'].title} `,
    placeholder: 'Search folders…',
    items: store.folders.list.map((folder) => ({ name: folder.title, description: '', value: folder.id })),
    onPick: actions.openFolder,
  });
  navigation.select('picker');
};
