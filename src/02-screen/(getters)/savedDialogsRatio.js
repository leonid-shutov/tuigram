/** @type {() => ScreenSelf['savedDialogsRatio']} */
() => {
  const text = Result.from(() => node.fs.readFileSync(config.paths.uiState, 'utf8'));
  if (!text.ok) return null;
  const parsed = Result.from(() => JSON.parse(text.unwrap()));
  if (!parsed.ok) return null;
  const ratio = parsed.unwrap()?.dialogsRatio;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
};
