/** @type {typeof Bubble.senderColor} */
(key) => config.theme.senderColors[Hash.fnv1a(key) % config.theme.senderColors.length];
