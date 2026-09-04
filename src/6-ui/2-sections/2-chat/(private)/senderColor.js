// Hash the sender key into the theme's sender palette, so the same person keeps the same
// color for the whole session and across restarts.
/** @type {ChatSelf['senderColor']} */
(key) => config.theme.senderColors[Hash.fnv1a(key) % config.theme.senderColors.length];
