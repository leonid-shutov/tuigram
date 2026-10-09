self.emitter ??= new node.events.EventEmitter();

/** @type {DialogsStoreSelf['emit']} */
(event) => void self.emitter.emit(event);
