// Read on every dialogs change, so it counts rather than copies the archive.
/** @type {() => DialogsStoreSelf['hasArchived']} */
() => self.archive.size > 0;
