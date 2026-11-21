self.emitter ??= new node.events.EventEmitter();

/** @type {ChoiceSection['on']} */
(event, handler) => void self.emitter.on(event, handler);
