/** @type {PickerSection['focus']} */
() => {
  self.search.reset();
  self.component.visible = true;
  self.search.focus();
};
