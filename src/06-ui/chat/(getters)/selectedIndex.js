/** @type {() => ChatSelf['selectedIndex']} */
() => (self.selectedMessageId === null ? -1 : self.views.indexOf(self.selectedMessageId));
