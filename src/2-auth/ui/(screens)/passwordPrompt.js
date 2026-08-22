(invalid) =>
  self.askPassword({
    label: invalid ? 'That password was not accepted. Try again:' : 'Two-step verification password:',
    hint: 'Enter: continue   Ctrl-C: quit',
  });
