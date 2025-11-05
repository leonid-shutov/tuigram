() => {
  const currentSelection = module.brain.currentSelection;
  const currentOpened = module.brain.currentOpened;
  const nextSelection = module.brain.next();

  const maxDialogs = module.ui.config.maxDialogs;

  const currentIndexOnPage = currentSelection.index % maxDialogs;
  const nextIndexOnPage = nextSelection.index % maxDialogs;

  if (currentSelection.index === -1 && nextSelection.index === 0) {
    const initialDialogs = module.brain.dialogs.slice(0, maxDialogs);
    module.ui.setDialogs(initialDialogs);
  } else if (nextIndexOnPage === 0) {
    const nextPageDialogs = module.brain.dialogs.slice(
      nextSelection.index,
      nextSelection.index + maxDialogs,
    );
    module.ui.setDialogs(nextPageDialogs);
  }

  if (currentSelection.index !== currentOpened.index && nextIndexOnPage !== 0) {
    module.ui.deselect(currentIndexOnPage);
  }
  if (nextSelection.index !== currentOpened.index) {
    module.ui.select(nextIndexOnPage);
  }

  screen.render();
};
