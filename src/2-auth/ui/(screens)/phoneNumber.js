// Phone + code fallback, reached by pressing `p` on the QR screen.
() =>
  self.ask({
    label: 'Phone number, with the country code:',
    hint: 'Enter: send me a code   Ctrl-C: quit',
    placeholder: '+15551234567',
  });
