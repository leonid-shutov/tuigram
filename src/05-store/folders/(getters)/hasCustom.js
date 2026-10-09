// Every list holds "All chats"; anything past it is a folder the user made.
/** @type {() => FoldersStoreSelf['hasCustom']} */
() => self.list.length > 1;
