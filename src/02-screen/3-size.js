const MAX_WIDTH = 140;
const MAX_HEIGHT = 48;
const DIALOGS_RATIO = 0.34;
const DIALOGS_MIN = 22;
const DIALOGS_DEFAULT_MAX = 34;

const width = Math.min(screen.renderer.width, MAX_WIDTH);
const height = Math.min(screen.renderer.height, MAX_HEIGHT);

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
