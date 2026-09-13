self.emitter ??= new node.events.EventEmitter();

/** @type {DialogsSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
