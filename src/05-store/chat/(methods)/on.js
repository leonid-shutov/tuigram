self.emitter ??= new node.events.EventEmitter();

/** @type {ChatStoreSelf['on']} */
(event, handler) => void self.emitter.on(event, handler);
