() => {
  const currentSelection = module.brain.currentSelection;
  const currentOpened = module.brain.currentOpened;
  const prevSelection = module.brain.prev();

  if (currentSelection.index !== currentOpened.index) {
    module.ui.deselect(prevSelection.index + 1);
  }
  if (prevSelection.index !== currentOpened.index) {
    module.ui.select(prevSelection.index);
  }

  screen.render();
};
