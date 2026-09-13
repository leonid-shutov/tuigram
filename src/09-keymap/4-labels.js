/** @type {[SectionName, string][]} */
const PANES = [
  ['dialogs', 'app.focusDialogs'],
  ['chat', 'app.focusChat'],
  ['messagePrompt', 'app.focusPrompt'],
];

const byCommand = keymap.engine.getCommandBindings({
  visibility: 'registered',
  commands: PANES.map(([, command]) => command),
});

/** @param {readonly KeymapActiveBinding[]} bindings */
const plainest = (bindings) =>
  bindings.find(({ sequence }) => sequence.every(({ stroke }) => !stroke.ctrl && !stroke.meta && !stroke.shift)) ??
  bindings[0];

for (const [section, command] of PANES) {
  const binding = plainest(byCommand.get(command) ?? []);
  if (binding === undefined) continue;
  ui[section].setLabel(` ${Keymap.extras.formatKeySequence(binding.sequence)} `);
}

ui.picker.setLabel(` ${keymap.commands.app['app.search'].title} `);
