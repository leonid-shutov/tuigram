/** @type {typeof Message.isEditable} */
(message) => message.sender.isSelf && !message.pending;
