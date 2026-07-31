() => {
  self.input.focus();
  self.focused = true;
  nvim.input('i');
};
