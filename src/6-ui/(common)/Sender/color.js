/** @type {typeof Sender.color} */
(key) => config.theme.senderColors[Hash.fnv1a(key) % config.theme.senderColors.length];
