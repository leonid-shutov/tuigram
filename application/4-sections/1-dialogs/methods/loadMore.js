((iterator) => async () => {
  await node.timers.promises.setTimeout(100);
  const { value: moreDialogs, done } = await iterator.next();
  return done ? [] : moreDialogs;
})(messenger.getDialogs(9));
