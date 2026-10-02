/** @type {typeof Base64.decodeFragments} */
(fragments) => {
  if (!Array.isArray(fragments)) return '';
  return node.buffer.Buffer.from(fragments.join(''), 'base64').toString('utf8').trim();
};
