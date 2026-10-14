/** @type {() => ChatStoreSelf['opened']} */
() => (self.openChatId === null ? null : self.getById(self.openChatId));
