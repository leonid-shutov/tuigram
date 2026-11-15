// `label` in the configured language: the ms table's entry when `language` is `ms`,
// else the English label unchanged. Extra args fill each `%s` in turn, for the few
// labels built around a name or version. Unknown labels fall back to English, so a
// label added without a Malay entry yet still reads.
/** @type {typeof Locale.t} */
(label, ...args) => {
  let pattern = label;
  if (config.language === 'ms') pattern = Locale.ms[label] ?? label;
  if (args.length === 0) return pattern;
  let i = 0;
  return pattern.replace(/%s/gu, () => {
    const next = i < args.length ? args[i] : '%s';
    i += 1;
    return String(next);
  });
};
