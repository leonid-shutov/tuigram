// The app fills the terminal, whatever its size: what keeps a wide one readable is each part's own
// cap (a post's width, a pop-up's size), not a box around the whole app. The dialogs pane is
// kept in cells, so the extra room of a wide terminal goes to the chat, not the list.
const DIALOGS_RATIO = 0.34;
const DIALOGS_DEFAULT_MAX = 34;

const { min, max } = self.dialogsBounds;
const clamp = (/** @type {number} */ cells) => Math.min(Math.max(cells, min), max);

const saved = self.savedDialogsWidth;
const dialogsWidth =
  saved === null
    ? clamp(Math.min(Math.max(Math.round(screen.renderer.width * DIALOGS_RATIO), min), DIALOGS_DEFAULT_MAX))
    : clamp(saved);

({ dialogsWidth });
