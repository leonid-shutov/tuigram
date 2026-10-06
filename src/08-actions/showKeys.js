/** @type {Actions['showKeys']} */
() => {
  // Read before the picker takes focus: what is `active` depends on which pane has it.
  const entries = keymap.available(navigation.selected).filter(({ name }) => name !== 'app.help');
  const byName = Arr.keyBy('name', entries);
  ui.picker.open({
    title: ` ${keymap.commands.app['app.help'].title} `,
    placeholder: 'Search keys…',
    // Every binding, not only the plainest the bar shows, so this also teaches the alternatives.
    items: entries.map(({ name, command, bindings }) => ({
      name: command.title,
      description: bindings.map(Binding.format).join(', '),
      value: name,
    })),
    // Back first, so the command runs in the pane it belongs to.
    onPick: (name) => {
      navigation.back();
      byName.get(name)?.command.run();
    },
  });
  navigation.select('picker');
};
