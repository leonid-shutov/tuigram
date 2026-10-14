tui
  .createCliRenderer({
    exitOnCtrlC: true,
    openConsoleOnError: false,
    onDestroy: () => Crash.exit(null, 0),
  })
  .then((renderer) => {
    renderer.setBackgroundColor(config.theme.bg);
    return renderer;
  });
