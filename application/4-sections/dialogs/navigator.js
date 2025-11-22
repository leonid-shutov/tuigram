({
  next() {
    const { currentSelection, currentOpened } = module.brain;
    const nextSelection = module.brain.next();

    const maxDialogs = module.ui.config.maxDialogs;

    const currentIndexOnPage = currentSelection.index % maxDialogs;
    const nextIndexOnPage = nextSelection.index % maxDialogs;

    if (currentSelection.index === -1 && nextSelection.index === 0) {
      self._goToPage(0);
    } else if (nextIndexOnPage === 0) {
      self._goToPage(module.brain.currentPage.index + 1);
    }

    if (
      currentSelection.index !== currentOpened.index &&
      nextIndexOnPage !== 0
    ) {
      module.ui.deselect(currentIndexOnPage);
    }
    if (nextSelection.index !== currentOpened.index) {
      module.ui.select(nextIndexOnPage);
    }

    screen.render();
  },

  prev() {
    const { currentSelection, currentOpened } = module.brain;
    const prevSelection = module.brain.prev();

    const maxDialogs = module.ui.config.maxDialogs;

    const currentIndexOnPage = currentSelection.index % maxDialogs;
    const prevIndexOnPage = prevSelection.index % maxDialogs;

    if (currentIndexOnPage === 0) {
      self._goToPage(module.brain.currentPage.index - 1);
    }

    if (currentSelection.index !== currentOpened.index) {
      module.ui.deselect(currentIndexOnPage);
    }
    if (prevSelection.index !== currentOpened.index) {
      module.ui.select(prevIndexOnPage);
    }

    screen.render();
  },

  _goToPage(pageIndex) {
    module.brain.setPage(pageIndex);
    const maxDialogs = module.ui.config.maxDialogs;
    const firstIndex = maxDialogs * pageIndex;
    const lastIndex = firstIndex + maxDialogs;
    const dialogs = module.brain.dialogs.slice(firstIndex, lastIndex);
    module.ui.setDialogs(dialogs);
    const { currentOpened } = module.brain;
    if (currentOpened.index >= firstIndex && currentOpened.index <= lastIndex) {
      const openedIndexOnPage = currentOpened.index % maxDialogs;
      module.ui.open(openedIndexOnPage);
    }
  },
});
