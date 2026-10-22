self.emitter ??= new node.events.EventEmitter();

/** @type {PeersStoreSelf['on']} */
(event, handler) => void self.emitter.on(event, handler);
