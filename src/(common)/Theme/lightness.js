// CIE L*: perceived lightness, 0 (black) to 100 (white). A contrast ratio answers "can I read
// text on this"; L* answers "can I see that this block is shaded differently", and unlike a
// ratio it is perceptually uniform — the same ΔL* looks like the same step on any theme.
/** @type {typeof Theme.lightness} */
(color) => {
  const channel = (/** @type {number} */ value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const y = 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  return 116 * (y > 0.008856 ? Math.cbrt(y) : 7.787 * y + 16 / 116) - 16;
};
