// Passing any alias switches formatting off the written form, so the modifiers have to be spelled
// out too. Arrows are drawn as arrows, so a reader who doesn't know vim sees the keys they'd reach
// for. They are ambiguous-width, but only a terminal drawing those two cells wide would mis-measure
// the bar, and that one already breaks every border; `⏎` stays `enter`, since it is wide in some.
const FORMAT = {
  separator: '', // `gg`, not `g g`
  keyNameAliases: { escape: 'esc', up: '↑', down: '↓', left: '←', right: '→' }, // `return` already formats as `enter`
  modifierAliases: { meta: 'alt' },
};

// Shift on a lone letter reads as the capital, as vim and less write it: `G`, not `shift+g`. Only
// when Shift is the sole modifier: `alt+U` is too easily read as `alt+u`, and `tab` or `up` have no
// capital to fall back on.
/** @param {import('@opentui/keymap/extras').KeySequenceFormatPart} part */
const capitalize = (part) => {
  const { name, shift, ctrl, meta, super: sup } = part.stroke;
  if (!shift || ctrl || meta || sup || !/^[a-z]$/.test(name)) return part;
  return { ...part, stroke: { ...part.stroke, name: name.toUpperCase(), shift: false } };
};

/** @type {typeof Binding.format} */
(binding) => Keymap.extras.formatKeySequence(binding.sequence.map(capitalize), FORMAT);
