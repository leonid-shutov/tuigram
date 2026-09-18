tui.createCliRenderer({ exitOnCtrlC: true, openConsoleOnError: false }).then((renderer) => {
  renderer.setBackgroundColor(config.theme.bg);
  return renderer;
});
