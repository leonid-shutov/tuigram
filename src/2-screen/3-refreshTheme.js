// Asks the terminal what its colors are — its palette (OSC 4) and its default fg/bg (OSC
// 10/11) — and re-derives every role that depends on the answer, writing the result into
// config.theme.
//
// This is the one place the app reaches upwards a layer. It has to: detection needs a renderer
// that owns stdin, which layer 1 does not have, but every component reads config.theme. Both
// queries are raced against a timeout, because a terminal that does not implement them simply
// never answers.
const TIMEOUT = 300;

/** @type {ScreenSelf['refreshTheme']} */
async () => {
  const [mode, colors] = await Promise.all([
    self.renderer.waitForThemeMode(TIMEOUT),
    self.renderer.getPalette({ size: 16, timeout: TIMEOUT }),
  ]);
  // A terminal that ignored the query leaves these null, and normalizeTerminalPalette would
  // happily hand back 256 invented colors, so decide before normalizing.
  const detected = colors.defaultBackground === null ? null : tui.normalizeTerminalPalette(colors);

  Object.assign(config.theme, Theme.derive(mode ?? 'dark', detected));
};
