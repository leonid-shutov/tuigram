(char, name) => {
  if (name === 'return' && self.mode === 'normal') return self.send();
  return nvim.input(self.keycodes[name] ?? char);
};
