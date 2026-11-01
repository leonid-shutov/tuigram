const { commands, bindings } = keymap;

/** @param {Commands} group */
const named = (group) =>
  Object.entries(group).map(([name, command]) => ({
    ...command,
    name,
    run: () => void command.run(),
  }));

void keymap.engine.registerLayer({ commands: named(commands.app), bindings: bindings.global });

void keymap.engine.registerLayer({
  target: ui.dialogs.component,
  targetMode: 'focus-within',
  commands: named(commands.dialogs),
  bindings: [...bindings.dialogs, ...bindings.panes],
});

void keymap.engine.registerLayer({
  target: ui.dialogs.component,
  targetMode: 'focus-within',
  enabled: () => store.folders.hasCustom,
  commands: named(commands.folders),
  bindings: bindings.folders,
});

void keymap.engine.registerLayer({
  target: ui.chat.component,
  targetMode: 'focus-within',
  commands: [...named(commands.chat), ...named(commands.message)],
  bindings: [...bindings.chat, ...bindings.message, ...bindings.panes],
});

void keymap.engine.registerLayer({
  target: ui.messagePrompt.component,
  targetMode: 'focus-within',
  commands: named(commands.prompt),
  bindings: bindings.prompt,
});

void keymap.engine.registerLayer({
  target: ui.picker.component,
  targetMode: 'focus-within',
  commands: named(commands.picker),
  bindings: bindings.picker,
});

void keymap.engine.registerLayer({
  target: ui.choice.component,
  targetMode: 'focus-within',
  commands: named(commands.choice),
  bindings: bindings.choice,
});

const claimed = new Set(bindings.choice.map(({ key }) => key));
void keymap.engine.registerLayer({
  target: ui.choice.component,
  targetMode: 'focus-within',
  commands: Object.keys(commands.message).map((name) => ({ name, run: () => ui.choice.pickValue(name) })),
  bindings: bindings.message.filter(({ key }) => !claimed.has(key)),
});

void keymap.engine.registerLayer({
  target: ui.filePicker.component,
  targetMode: 'focus-within',
  enabled: () => !ui.filePicker.filtering,
  commands: named(commands.filePicker),
  bindings: bindings.filePickerBrowse,
});

void keymap.engine.registerLayer({
  target: ui.filePicker.component,
  targetMode: 'focus-within',
  enabled: () => ui.filePicker.filtering,
  commands: named(commands.filePicker),
  bindings: bindings.filePickerFilter,
});
