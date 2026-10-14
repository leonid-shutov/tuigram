self.emitter ??= new node.events.EventEmitter();

// A change to a closed chat lands silently: only the open one is on screen.
/** @type {ChatStoreSelf['emit']} */
(event, chatId) => {
  if (self.isOpen(chatId)) self.emitter.emit(event);
};
