// The form is picked by CLDR's rules for the language (Intl.PluralRules), so a table lists only
// the categories its language has: English one/other, Malay just other, the East Slavic ones
// one/few/many/other. `other` is the fallback every table has.
/** @type {typeof Locale.plural} */
(label, count, ...args) => {
  /** @type {Locale.Forms} */
  const forms = Locale[config.language][label];
  const category = new Intl.PluralRules(config.language).select(count);
  return Locale.fill((forms[category] ?? forms.other).replace(/%d/gu, String(count)), args);
};
