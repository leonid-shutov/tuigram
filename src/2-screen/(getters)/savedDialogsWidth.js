// Kept in cells, so a pane widened on one terminal is as wide on a bigger one.
/** @type {() => ScreenSelf['savedDialogsWidth']} */
() => {
  const text = Result.from(() => node.fs.readFileSync(config.paths.uiState, 'utf8'));
  if (!text.ok) return null;
  const parsed = Result.from(() => JSON.parse(text.unwrap()));
  if (!parsed.ok) return null;
  const width = parsed.unwrap()?.dialogsWidth;
  return Number.isSafeInteger(width) && width > 0 ? width : null;
};
