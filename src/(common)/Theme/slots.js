// Which ANSI palette slot each role borrows. Roles that must stand out from the background
// swap between the normal (0-7) and bright (8-15) family, because a terminal's normal colors
// are tuned to read on a light background and its bright ones on a dark one.
//
// Slots are quoted through RGBA.fromIndex, so the renderer emits 38;5;n / 48;5;n and the
// user's own overrides for that slot keep applying. Nothing here names a color: the numbers
// are positions in the user's palette, and the terminal supplies the pigment.
const index = (/** @type {number} */ slot) => tui.RGBA.fromIndex(slot);
const indexes = (/** @type {number[]} */ slots) => slots.map(index);

const dark = {
  accent: index(12),
  selfBorder: index(10),
  selected: index(13),
  // Bright red, green, yellow, blue, magenta, cyan, then two normals to widen the spread.
  senderColors: indexes([9, 10, 11, 12, 13, 14, 2, 6]),
};

const light = {
  accent: index(4),
  selfBorder: index(2),
  selected: index(5),
  // Six, not eight: a light terminal's bright slots are tuned to read on a dark background,
  // so they get demoted by the contrast guard onto the normal twins already in this list.
  // Callers take the hash modulo the length, so a shorter list just means more collisions.
  senderColors: indexes([1, 2, 3, 4, 5, 6]),
};

/** @type {typeof Theme.slots} */
(mode) => (mode === 'light' ? light : dark);
