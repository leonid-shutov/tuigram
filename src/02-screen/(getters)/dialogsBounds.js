// The widths the dialogs pane may take, from the terminal as it is now: at most half of it, and at
// least DIALOGS_MIN cells unless half is narrower still.
const DIALOGS_MIN = 22;

/** @type {() => ScreenModule['dialogsBounds']} */
() => {
  const max = Math.max(1, Math.floor(screen.renderer.width / 2));
  return { min: Math.min(DIALOGS_MIN, max), max };
};
