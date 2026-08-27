self.emitter ??= new node.events.EventEmitter();
/** @type {PickerOnImpl} */
(event, handler) => {
  self.emitter.on(event, handler);
};
