self.emitter ??= new node.events.EventEmitter();

/** @type {ChatSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
