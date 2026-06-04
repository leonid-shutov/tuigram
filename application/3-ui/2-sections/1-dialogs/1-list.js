(async () => {
  const dialogs = await $.loadMore();

  return new tui.SelectRenderable(ui.screen.renderer, {
    width: '100%',
    height: '100%',
    options: dialogs,
    selectedBackgroundColor: '#2d4f2d',
    focusedBackgroundColor: '#1a1a1a',
  });
})();
