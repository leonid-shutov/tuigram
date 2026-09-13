const { commands, bindings } = keymap;

/** @param {Commands} group */
const named = (group) => Object.entries(group).map(([name, command]) => ({ name, ...command }));

void keymap.engine.registerLayer({ commands: named(commands.app), bindings: bindings.global });

void keymap.engine.registerLayer({
  target: ui.dialogs.component,
  targetMode: 'focus-within',
  commands: named(commands.dialogs),
  bindings: [...bindings.dialogs, ...bindings.panes],
});

void keymap.engine.registerLayer({
  target: ui.chat.component,
  targetMode: 'focus-within',
  commands: named(commands.chat),
  bindings: [...bindings.chat, ...bindings.panes],
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
