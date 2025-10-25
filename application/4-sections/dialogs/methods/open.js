() => {
  const oldOpened = module.brain.currentOpened;
  module.ui.close(oldOpened.index);
  const newOpened = module.brain.open();
  module.ui.open(newOpened.index);
  screen.render();
};
