(char, name) => {
  if (name === 'return' && nvim.mode === 'normal') return self.send();
  return nvim.input(self.keycodes[name] ?? char);
};
