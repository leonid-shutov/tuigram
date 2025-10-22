() => {
  const { index } = module.brain.next();
  module.ui.deselect(index - 1);
  module.ui.select(index);
  screen.render();
};
