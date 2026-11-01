/** @type {Actions['showActions']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  const applicable = Object.entries(keymap.commands.message).filter(([, command]) => command.appliesTo(message));
  if (applicable.length === 0) return void ui.chat.flashStatus('nothing to do');
  const keys = keymap.engine.getCommandBindings({
    visibility: 'active',
    focused: ui.choice.list,
    commands: applicable.map(([name]) => name),
  });
  ui.choice.open({
    title: ` ${keymap.commands.chat['chat.actions'].title} `,
    message: Message.preview(message) ?? '',
    pickHint: 'Run',
    options: applicable.map(([name, { title }]) => ({
      name: title,
      value: name,
      keys: Binding.keys(keys.get(name) ?? []),
    })),
    /** @param {string} name */
    onPick: (name) => {
      navigation.select('chat');
      if (ui.chat.selectedMessage?.id !== message.id) return void ui.chat.flashStatus('message is gone');
      keymap.commands.message[name].run();
    },
  });
  navigation.select('choice');
};
