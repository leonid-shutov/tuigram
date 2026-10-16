/** @type {typeof Message.sameText} */
(a, b) =>
  a.text === b.text &&
  a.entities.length === b.entities.length &&
  a.entities.every(
    ({ offset, length, kind, url }, i) =>
      offset === b.entities[i].offset &&
      length === b.entities[i].length &&
      kind === b.entities[i].kind &&
      url === b.entities[i].url,
  );
