(async () => {
  const dialogs = await $.loadMore();
  const options = dialogs.map((d) => ({ name: d.name, description: d.lastMessage }));

  return new tui.SelectRenderable(ui.screen.renderer, {
    width: '100%',
    height: '100%',
    options,
    selectedBackgroundColor: '#2d4f2d',
    focusedBackgroundColor: '#1a1a1a',
  });
})();
