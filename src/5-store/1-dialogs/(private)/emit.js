/** @type {DialogsStoreSelf['emit']} */
(event, ...args) => {
  self.dialogEvents.emit(event, ...args);
};
