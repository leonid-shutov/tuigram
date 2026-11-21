self.emitter ??= new node.events.EventEmitter();

/** @type {PickerSection['on']} */
(event, handler) => void self.emitter.on(event, handler);
