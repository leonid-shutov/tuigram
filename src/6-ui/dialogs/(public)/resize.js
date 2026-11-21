const SAVE_DELAY_MS = 500;

/** @type {NodeJS.Timeout | null} */
let saveTimer = null;

const save = () => {
  const { dialogsWidth } = screen.size;
  void Cache.write(config.paths.uiState, node.buffer.Buffer.from(JSON.stringify({ dialogsWidth }))).catch(() => null);
};

/** @type {DialogsSection['resize']} */
(delta) => {
  const { dialogsWidth } = screen.size;
  const { min, max } = screen.dialogsBounds;
  const next = Math.min(Math.max(dialogsWidth + delta, min), max);
  if (next === dialogsWidth) return false;
  screen.size.dialogsWidth = next;
  self.component.width = next;

  if (saveTimer !== null) node.timers.clearTimeout(saveTimer);
  saveTimer = node.timers.setTimeout(save, SAVE_DELAY_MS);
  saveTimer.unref();

  return true;
};
