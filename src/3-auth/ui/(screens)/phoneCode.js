({ invalid, sentVia }) =>
  self.ask({
    label: invalid ? 'That code was not accepted. Try again:' : `Confirmation code (sent via ${sentVia}):`,
    hint: 'Enter: continue   Ctrl-C: quit',
    placeholder: '12345',
  });
