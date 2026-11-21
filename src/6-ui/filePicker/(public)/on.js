self.emitter ??= new node.events.EventEmitter();

/** @type {FilePickerOnImpl} */
(event, handler) => void self.emitter.on(event, handler);
