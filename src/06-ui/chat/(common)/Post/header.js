// The row a style puts over a post's body: who wrote it, in bold, and an aside after it (the time,
// in `thread`). `place` shows it only at the head of a run.
/** @type {typeof Post.header} */
({ name, color }, aside = '') => {
  const chunks = [tui.fg(color)(tui.bold(name))];
  if (aside !== '') chunks.push(tui.fg(config.theme.muted)(`  ${aside}`));
  return Text({ content: new tui.StyledText(chunks), flexShrink: 0, wrapMode: 'none' });
};
