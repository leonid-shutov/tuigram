self.emitter ??= new node.events.EventEmitter();

/** @type {FoldersStoreSelf['emit']} */
(event) => void self.emitter.emit(event);
