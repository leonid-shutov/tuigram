/** @type {PickerSection['pick']} */
() => {
  const value = self.search.selected;
  if (value !== null) self.request?.onPick(value);
};
