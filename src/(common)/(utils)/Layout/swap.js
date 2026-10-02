/** @type {typeof Layout.swap} */
(text) => {
  // The same physical keys, position for position, on QWERTY and ЙЦУКЕН.
  const en = `\`qwertyuiop[]asdfghjkl;'zxcvbnm,.`;
  const ru = 'ёйцукенгшщзхъфывапролджэячсмитьбю';

  return Array.from(text.toLowerCase(), (ch) => {
    const latin = en.indexOf(ch);
    if (latin !== -1) return ru[latin];
    const cyrillic = ru.indexOf(ch);
    return cyrillic === -1 ? ch : en[cyrillic];
  }).join('');
};
