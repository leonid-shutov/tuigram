() => {
  module.ui.open(newOpened.index);
  screen.render();
  module.emit("open", newOpened.index.toString());
};
