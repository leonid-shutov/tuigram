() => {
  const maxDialogs = module.ui.config.maxDialogs;
  const oldOpened = module.brain.currentOpened;
  const isOpenedWithinCurrPage = module.ui.close(oldOpened.index);
  const newOpened = module.brain.open();
  module.ui.open(newOpened.index);
  screen.render();
  module.emit("open", newOpened.index.toString());
};
