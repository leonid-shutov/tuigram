/** @type {Record<SectionName, 'dialogs' | 'chat' | 'prompt' | 'picker'>} */
const GROUPS = { dialogs: 'dialogs', chat: 'chat', messagePrompt: 'prompt', picker: 'picker' };

// Appended to every section's own keys. The 1/2/3 pane jumps stay off the bar — 4-labels.js
// already prints them on the pane borders.
const TAIL = ['app.search', 'app.cycleNext'];

// Passing any alias switches formatting off the written form, so the modifiers have to be spelled
// out too. All-ASCII on purpose: arrows and ⏎ are ambiguous-width and would mis-measure the bar.
const FORMAT = {
  separator: '', // `gg`, not `g g`
  keyNameAliases: { escape: 'esc' }, // `return` already formats as `enter`
  modifierAliases: { meta: 'alt' },
};

/** @type {KeymapModule['hints']} */
(section) => {
  /** @type {[string, Command][]} */
  const tail = TAIL.map((name) => [name, keymap.commands.app[name]]);
  const entries = [...Object.entries(keymap.commands[GROUPS[section]]), ...tail];

  // `active` — not the `registered` of 4-labels.js — is what makes the bar focus-aware: it drops
  // what the focused layers cannot reach, and orders the rest by precedence. So the panes advertise
  // `/` for search while the message box, where the unmodified bindings are deliberately not
  // installed, advertises `ctrl+p`.
  const byCommand = keymap.engine.getCommandBindings({
    visibility: 'active',
    commands: entries.map(([name]) => name),
  });

  /** @type {Hint[]} */
  const hints = [];
  for (const [name, command] of entries) {
    const binding = Binding.plainest(byCommand.get(name) ?? []);
    if (binding === undefined) continue;
    hints.push({
      keys: Keymap.extras.formatKeySequence(binding.sequence, FORMAT),
      label: command.hint ?? command.title,
    });
  }
  return hints;
};
