() => {
  const dialogs = module.state.open();
  module.ui.setDialogs(dialogs);
  module.emit("open", module.state.opened.index.toString());
};
