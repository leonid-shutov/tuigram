self.emitter ??= new node.events.EventEmitter();
/** @type {PickerSelf['emit']} */
(event, ...args) => {
  self.emitter.emit(event, ...args);
};
