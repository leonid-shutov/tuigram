((iterator) => async () => {
  //await node.timers.promises.setTimeout(5000);
  const { value, done } = await iterator.next();
  const moreDialogs = value.map($.toDialog);
  return done ? [] : moreDialogs;
})(messenger.getDialogs(9));
