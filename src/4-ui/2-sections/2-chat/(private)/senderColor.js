// FNV-1a over the sender key, indexed into the theme's sender palette, so the same person
// keeps the same color for the whole session and across restarts.
(key) => {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return theme.senderColors[Math.abs(hash) % theme.senderColors.length];
};
