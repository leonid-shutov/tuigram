() => {
  const dialogs = module.state.open();
  module.ui.setDialogs(dialogs);
  module.emit("open", newOpened.index.toString());
};
