// opentui's SelectRenderable has no mouse handling of its own: a click has to be turned into a row
// here. It lays its options out at a private row height, scrolled by its own private offset; both
// are read off the instance, the one place that needs them.
/**
 * @param {import('@opentui/core').SelectRenderable} select
 * @param {number} y The terminal row clicked.
 * @returns {number} The option under it, or -1.
 */
(select, y) => {
  const height = Number(Reflect.get(select, 'linesPerItem') ?? 0);
  if (!(height > 0)) return -1;
  const offset = Number(Reflect.get(select, 'scrollOffset') ?? 0);
  const index = offset + Math.floor((y - select.screenY) / height);
  return index >= 0 && index < select.options.length ? index : -1;
};
