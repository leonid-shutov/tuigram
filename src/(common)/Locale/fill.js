/** @type {typeof Locale.fill} */
(text, args) => {
  const rest = [...args];
  return text.replace(/%s/gu, () => (rest.length > 0 ? String(rest.shift()) : '%s'));
};
