// Telegram's answers to an app key it will not take, whatever the reason. Duck-typed on `.text` —
// mtcute's RpcError comes from the Node realm, so `instanceof` is always false in here.
const REJECTED = ['API_ID_PUBLISHED_FLOOD', 'API_ID_INVALID', 'CONNECTION_API_ID_INVALID'];

/** @type {AuthSelf['keyRejected']} */
(error) => {
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const text = /** @type {any} */ (error)?.text;
  return REJECTED.includes(text);
};
