// The app box never grows past `maxWidth`/`maxHeight` (a 0 lifts the cap and follows the
// terminal); the wrapper centers whatever is left, so a capped app sits in the middle of a
// wider terminal. Read once at boot, like the rest of the layout — changing the keys needs a
// restart, same as resizing the terminal itself does.
const DIALOGS_RATIO = 0.34;
const DIALOGS_MIN = 22;
const DIALOGS_DEFAULT_MAX = 34;

const width = config.maxWidth === 0 ? screen.renderer.width : Math.min(screen.renderer.width, config.maxWidth);
const height = config.maxHeight === 0 ? screen.renderer.height : Math.min(screen.renderer.height, config.maxHeight);

const dialogsMax = Math.floor(width / 2);
const dialogsMin = Math.min(DIALOGS_MIN, dialogsMax);
const defaultMax = Math.min(DIALOGS_DEFAULT_MAX, dialogsMax);
const clamp = (/** @type {number} */ cells) => Math.min(Math.max(cells, dialogsMin), dialogsMax);

const saved = self.savedDialogsRatio;
const dialogsWidth =
  saved === null
    ? Math.min(Math.max(Math.round(width * DIALOGS_RATIO), DIALOGS_MIN), defaultMax)
    : clamp(Math.round(width * saved));

({ width, height, dialogsWidth, dialogsMin, dialogsMax });
