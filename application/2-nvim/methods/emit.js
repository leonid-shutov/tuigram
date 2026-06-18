$.ee ??= new node.events.EventEmitter();
(event, ...args) => $.ee.emit(event, ...args);
