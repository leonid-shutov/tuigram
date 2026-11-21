self.emitter ??= new node.events.EventEmitter();

/** @type {PickerSelf['emit']} */
(event, ...args) => void self.emitter.emit(event, ...args);
