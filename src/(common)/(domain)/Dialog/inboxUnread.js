/** @type {typeof Dialog.inboxUnread} */
({ unreadCount, inboxReadUpTo }) => (unreadCount > 0 ? { after: inboxReadUpTo, count: unreadCount } : null);
