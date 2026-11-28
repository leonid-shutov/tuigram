// Every list holds "All chats"; anything past it is another view to move between, the archive
// when it has chats or a folder the user made.
/** @type {() => FoldersStoreSelf['hasOthers']} */
() => self.list.length > 1;
