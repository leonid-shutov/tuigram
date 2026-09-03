// FNV-1a over a string, as an unsigned 32-bit int. Callers take it modulo a palette size to
// get a stable, restart-safe index for a peer.
/** @type {typeof Hash.fnv1a} */
(key) => {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
