self.emitter ??= new node.events.EventEmitter();

/** @type {PickerOnImpl} */
(event, handler) => void self.emitter.on(event, handler);
