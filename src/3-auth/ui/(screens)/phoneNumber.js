/** @type {AuthUiModule['phoneNumber']} */
() =>
  self.ask({
    label: Locale.t('Phone number, with the country code:'),
    hint: Locale.t('Enter: send me a code   Ctrl-C: quit'),
    placeholder: '+15551234567',
  });
