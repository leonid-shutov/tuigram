world.terminal.createRenderer({
  exitOnCtrlC: true,
  openConsoleOnError: false,
  backgroundColor: config.theme.bg,
  onDestroy: () => Crash.exit(null, 0),
});
