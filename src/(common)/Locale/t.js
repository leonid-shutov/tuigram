/** @type {typeof Locale.t} */
(label, ...args) => {
  /** @type {string} */
  let text = label;
  if (config.language !== 'en') text = Locale[config.language][label] ?? label;
  return text.replace(/%s/gu, () => (args.length > 0 ? String(args.shift()) : '%s'));
};
