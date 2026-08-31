/** @type {PickerSelf['blur']} */
() => {
  self.component.visible = false;
  self.input.blur();
};
