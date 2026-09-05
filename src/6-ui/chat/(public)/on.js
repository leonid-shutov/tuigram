self.emitter ??= new node.events.EventEmitter();

/** @type {ChatSection['on']} */
(event, handler) => void self.emitter.on(event, handler);
