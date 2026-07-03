(ch) => {
  if (ch === 'x') self.send();
  nvim.input(ch);
};
