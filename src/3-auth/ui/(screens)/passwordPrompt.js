/** @type {AuthUiModule['passwordPrompt']} */
(invalid) =>
  self.askPassword({
    label: invalid
      ? Locale.t('That password was not accepted. Try again:')
      : Locale.t('Two-step verification password:'),
    hint: Locale.t('Enter: continue   Ctrl-C: quit'),
  });
