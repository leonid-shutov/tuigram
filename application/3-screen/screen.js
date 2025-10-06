(() => {
  const screen = blessed.screen({
    smartCSR: true,
    title: "Custom Input",
  });

  screen.render();
  screen.program.showCursor();
  screen.key(["q", "C-c"], () => process.exit(0));

  return {
    append: screen.append.bind(screen),
    render: screen.render.bind(screen),
    on: screen.on.bind(screen),
    moveCursor: screen.program.move.bind(screen.program),
  };
})();
