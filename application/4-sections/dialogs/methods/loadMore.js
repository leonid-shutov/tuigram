((iterator) => async () => {
  const { value: moreDialogs, done } = await iterator.next();
  if (done) return;
  const lastIndex = module.brain.lastIndex();
  for (const [i, dialog] of moreDialogs.entries()) {
    module.brain.addDialog(dialog);
    module.ui.addDialog(lastIndex + i + 1, dialog);
  }
  screen.render();
})(messenger.getDialogs(10));
