// Linear blend of two colors, `t` of the way from `a` to `b`. The result is a literal RGB
// color — a blend no longer stands for a palette slot, so it cannot carry the intent of
// either operand.
/** @type {typeof Theme.mix} */
(a, b, t) => {
  const lerp = (/** @type {number} */ from, /** @type {number} */ to) => Math.round((from + (to - from) * t) * 255);
  return tui.RGBA.fromInts(lerp(a.r, b.r), lerp(a.g, b.g), lerp(a.b, b.b), 255);
};
