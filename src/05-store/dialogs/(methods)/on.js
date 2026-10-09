self.emitter ??= new node.events.EventEmitter();

/** @type {DialogsStoreSelf['on']} */
(event, handler) => void self.emitter.on(event, handler);
