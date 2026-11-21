/** @type {ChoiceSection['pick']} */
() => {
  const option = self.list.getSelectedOption();
  if (option) self.choosing?.onPick(option.value);
};
