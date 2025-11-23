((iterator) => async () => {
  const { value: moreDialogs, done } = await iterator.next();
  if (done) return;
  for (const dialog of moreDialogs) module.state.addDialog(dialog);
})(messenger.getDialogs(100));
