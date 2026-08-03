self.emitter ??= new node.events.EventEmitter();
(event, ...args) => self.emitter.emit(event, ...args);
