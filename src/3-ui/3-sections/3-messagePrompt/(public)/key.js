(ch) => {
  if (ch === '\r' && self.mode === 'normal') self.send();
  else nvim.input(ch);
};
