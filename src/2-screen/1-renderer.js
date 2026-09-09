tui.createCliRenderer({ exitOnCtrlC: true }).then((renderer) => {
  renderer.setBackgroundColor(config.theme.bg);
  return renderer;
});
