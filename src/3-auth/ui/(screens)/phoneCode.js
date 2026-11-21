/** @type {AuthUiModule['phoneCode']} */
({ invalid, sentVia }) =>
  self.ask({
    label: invalid
      ? Locale.t('That code was not accepted. Try again:')
      : Locale.t('Confirmation code (sent via %s):', sentVia),
    hint: Locale.t('Enter: continue   Ctrl-C: quit'),
    placeholder: '12345',
  });
