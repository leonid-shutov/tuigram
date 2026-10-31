// Which of a command's bindings to show: the one a reader can type without knowing vim. A letter
// standing in for a key (`j` for ↓, `l` for →) is the last resort, so an arrow wins even with a
// modifier on it (`shift+↓` over `J`); among the rest, the unmodified one. A command bound to
// letters alone (`y`, `G`) shows its first.
/** @param {KeymapActiveBinding} binding */
const obscurity = ({ sequence }) => {
  const isLetter = sequence.every(({ stroke }) => /^[a-z]$/.test(stroke.name) && !stroke.ctrl && !stroke.meta);
  if (isLetter) return 2;
  const isArrow = sequence.every(({ stroke }) => ['up', 'down', 'left', 'right'].includes(stroke.name));
  const isModified = sequence.some(({ stroke }) => stroke.ctrl || stroke.meta || stroke.shift);
  return isModified && !isArrow ? 1 : 0;
};

/** @type {typeof Binding.plainest} */
(bindings) => {
  let best = bindings[0];
  for (const binding of bindings) if (obscurity(binding) < obscurity(best)) best = binding;
  return best;
};
