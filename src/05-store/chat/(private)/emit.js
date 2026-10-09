self.emitter ??= new node.events.EventEmitter();

/** @type {ChatStoreSelf['emit']} */
(event) => void self.emitter.emit(event);
