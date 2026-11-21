/** @type {typeof Locale.t} */
(label, ...args) => Locale.fill(config.language === 'en' ? label : Locale[config.language][label], args);
