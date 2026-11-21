/** @type {ChoiceSection['pickValue']} */
(value) => {
  const index = self.list.options.findIndex(
    (/** @type {import('@opentui/core').SelectOption} */ option) => option.value === value,
  );
  if (index === -1) return;
  self.list.setSelectedIndex(index);
  self.pick();
};
