self.emitter ??= new node.events.EventEmitter();

/** @type {PeersStoreSelf['emit']} */
(event) => void self.emitter.emit(event);
