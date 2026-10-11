self.emitter ??= new node.events.EventEmitter();

/** @type {ChoiceSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
