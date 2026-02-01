async () => {
  console.dir('more');
  await node.timers.promises.setTimeout(4000);
  const { value: moreMessages, done } = await $.iterator.next();
  return done ? [] : moreMessages;
};
