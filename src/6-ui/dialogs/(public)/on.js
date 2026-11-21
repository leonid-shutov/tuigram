self.emitter ??= new node.events.EventEmitter();

/** @type {DialogsSection['on']} */
(event, handler) => void self.emitter.on(event, handler);
