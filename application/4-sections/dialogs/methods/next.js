() => {
  const currentSelection = module.brain.currentSelection;
  const currentOpened = module.brain.currentOpened;
  const nextSelection = module.brain.next();

  if (currentSelection.index !== currentOpened.index) {
    module.ui.deselect(nextSelection.index - 1);
  }
  if (nextSelection.index !== currentOpened.index) {
    module.ui.select(nextSelection.index);
  }

  screen.render();
};
