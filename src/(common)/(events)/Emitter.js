// The one event mechanism. Sections that report user intent build one of these and expose
// its `on`; nothing else in the app emits. Keeping the EventEmitter behind a two-method
// handle means a section never leaks its emitter to a caller who could emit into it.
/** @type {typeof Emitter} */
() => {
  const emitter = new node.events.EventEmitter();
  return {
    on: (event, handler) => void emitter.on(event, handler),
    emit: (event, ...args) => void emitter.emit(event, ...args),
  };
};
