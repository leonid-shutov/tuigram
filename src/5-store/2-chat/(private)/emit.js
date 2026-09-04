/** @type {ChatStoreSelf['emit']} */
(event, ...args) => {
  self.chatEvents.emit(event, ...args);
};
