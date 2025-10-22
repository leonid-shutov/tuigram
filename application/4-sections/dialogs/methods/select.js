() => {
  module.ui.container.style.border.fg = "green";
  if (!module.brain.hasSelection()) module.next();
};
