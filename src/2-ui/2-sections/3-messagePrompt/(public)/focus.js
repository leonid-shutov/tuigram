() => {
  self.component.borderColor = theme.accent;
  self.component.titleColor = theme.accent;
  input.focus();
  self.focused = true;
  self.editor.focus();
};
