() => {
  self.component.visible = false;
  self.input.blur();
  self.emit('capture', false);
};
