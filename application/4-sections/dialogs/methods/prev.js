() => {
  const currentSelection = module.brain.currentSelection;
  const currentOpened = module.brain.currentOpened;
  const prevSelection = module.brain.prev();

  if (
    prevSelection.index !== 0 &&
    currentSelection.index % module.maxDialogs() === 0
  ) {
    const prevPageDialogs = module.brain.dialogs.slice(
      currentSelection.index - module.maxDialogs(),
      currentSelection.index,
    );
    module.ui.setDialogs(prevPageDialogs);
  }

  if (currentSelection.index !== currentOpened.index) {
    module.ui.deselect(prevSelection.index + 1);
  }
  if (prevSelection.index !== currentOpened.index) {
    module.ui.select(prevSelection.index % module.maxDialogs());
  }

  screen.render();
};
