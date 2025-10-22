(async () => {
  await Promise.all(
    Object.values(sections).map((section) => section.mount(screen)),
  );
  await node.timers.promises.setTimeout(1000);
  await sections.dialogs.loadMore();
})();
