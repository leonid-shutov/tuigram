// Appended to every section's own keys. The 1/2/3 pane jumps stay off the bar — 4-labels.js
// already prints them on the pane borders.
const TAIL = ['app.search', 'app.cycleNext', 'app.help'];

/** @param {AvailableCommand} entry */
const keysOf = ({ bindings }) => {
  const binding = Binding.plainest(bindings);
  return binding === undefined ? '' : Binding.format(binding);
};

/** @type {KeymapModule['hints']} */
(section) => {
  const available = keymap.available(section);
  const byName = Arr.keyBy('name', available);
  const own = available.filter(({ name }) => !name.startsWith('app.'));
  const tail = TAIL.flatMap((name) => byName.get(name) ?? []);

  // Collected up front: a partner can be declared before its lead (`l` before `h`).
  const folded = new Set(
    available.flatMap(({ command }) => (command.pair && byName.has(command.pair.with) ? [command.pair.with] : [])),
  );

  /** @type {Hint[]} */
  const hints = [];
  for (const entry of [...own, ...tail]) {
    const { command } = entry;
    if (folded.has(entry.name) || command.hint === false) continue;
    const priority = command.priority ?? 'normal';
    const partner = command.pair && byName.get(command.pair.with);
    if (command.pair && partner) {
      hints.push({ keys: `${keysOf(entry)}/${keysOf(partner)}`, label: command.pair.hint, priority });
    } else {
      hints.push({ keys: keysOf(entry), label: command.hint ?? command.title, priority });
    }
  }
  return hints;
};
