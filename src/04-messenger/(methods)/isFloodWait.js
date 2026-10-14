/** @type {MessengerModule['isFloodWait']} */
(error) => {
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const text = /** @type {any} */ (error)?.text;
  return text === 'FLOOD_WAIT_%d';
};
