self.emitter ??= new node.events.EventEmitter();

/** @type {FilePickerSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
