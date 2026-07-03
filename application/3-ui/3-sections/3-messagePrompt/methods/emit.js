self.ee ??= new node.events.EventEmitter();
(event, ...args) => self.ee.emit(event, ...args);
