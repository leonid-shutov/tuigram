/** @type {typeof Message.isAfter} */
(message, id) => message.partIds.some((partId) => partId > id);
