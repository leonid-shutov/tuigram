self.emitter ??= new node.events.EventEmitter();
(event, handler) => self.emitter.on(event, handler);
