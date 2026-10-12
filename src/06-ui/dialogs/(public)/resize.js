const SAVE_DELAY_MS = 500;

/** @type {NodeJS.Timeout | null} */
let saveTimer = null;

const save = () => {
  const dialogsRatio = Math.round((screen.size.dialogsWidth / screen.size.width) * 10000) / 10000;
  void Cache.write(config.paths.uiState, node.buffer.Buffer.from(JSON.stringify({ dialogsRatio }))).catch(() => null);
};

/** @type {DialogsSection['resize']} */
(delta) => {
  const { dialogsWidth, dialogsMin, dialogsMax } = screen.size;
  const next = Math.min(Math.max(dialogsWidth + delta, dialogsMin), dialogsMax);
  if (next === dialogsWidth) return false;
  screen.size.dialogsWidth = next;
  self.component.width = next;

  if (saveTimer !== null) node.timers.clearTimeout(saveTimer);
  saveTimer = node.timers.setTimeout(save, SAVE_DELAY_MS);
  saveTimer.unref();

  return true;
};
