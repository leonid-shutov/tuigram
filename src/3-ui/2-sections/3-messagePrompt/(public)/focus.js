() => {
  self.component.borderColor = theme.accent;
  self.component.titleColor = theme.accent;
  self.input.focus();
  self.focused = true;
  nvim.input('i');
};
