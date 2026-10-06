/** @type {Record<SectionName, (keyof KeymapModule['commands'])[]>} */
const GROUPS = {
  dialogs: ['dialogs', 'folders'],
  chat: ['chat'],
  messagePrompt: ['prompt'],
  picker: ['picker'],
  filePicker: ['filePicker'],
};

/** @type {KeymapModule['available']} */
(section) => {
  /** @type {(keyof KeymapModule['commands'])[]} */
  const groups = [...GROUPS[section], 'app'];
  const entries = groups.flatMap((group) => Object.entries(keymap.commands[group]));

  // `active` — not the `registered` of 4-labels.js — is what makes this focus-aware: it drops what
  // the focused layers cannot reach, and orders the rest by precedence. So the panes advertise `/`
  // for search while the message box, where the unmodified bindings are deliberately not installed,
  // advertises `ctrl+p`.
  const byCommand = keymap.engine.getCommandBindings({
    visibility: 'active',
    commands: entries.map(([name]) => name),
  });

  /** @type {AvailableCommand[]} */
  const available = [];
  for (const [name, command] of entries) {
    const bindings = byCommand.get(name) ?? [];
    if (bindings.length > 0) available.push({ name, command, bindings: [...bindings] });
  }
  return available;
};
