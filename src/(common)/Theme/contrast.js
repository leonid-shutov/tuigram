// WCAG contrast ratio, 1 (identical) to 21 (black on white). Used to catch palette slots that
// vanish into the terminal's background — solarized keeps slot 8 within a hair of its own bg.
/** @type {typeof Theme.contrast} */
(a, b) => {
  const channel = (/** @type {number} */ value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const luminance = (/** @type {import('@opentui/core').RGBA} */ color) =>
    0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};
