() => {
  const { index } = module.brain.prev();
  module.ui.deselect(index + 1);
  module.ui.select(index);
  screen.render();
};
