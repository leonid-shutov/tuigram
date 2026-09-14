const MAX_WIDTH = 140;
const MAX_HEIGHT = 48;
const DIALOGS_RATIO = 0.26;
const DIALOGS_MIN = 22;
const DIALOGS_MAX = 34;

const width = Math.min(screen.renderer.width, MAX_WIDTH);
const height = Math.min(screen.renderer.height, MAX_HEIGHT);

const max = Math.min(DIALOGS_MAX, Math.floor(width / 2));
const dialogsWidth = Math.min(Math.max(Math.round(width * DIALOGS_RATIO), DIALOGS_MIN), max);

({ width, height, dialogsWidth });
