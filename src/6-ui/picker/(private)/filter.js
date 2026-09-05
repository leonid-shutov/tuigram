/** @type {PickerSelf['filter']} */
(query) => {
  const matches = self.items
    .map((dialog) => ({ dialog, score: Fuzzy.score(query, dialog.name) }))
    .filter((match) => match.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  self.list.options = matches.map(({ dialog }) => ({
    name: dialog.name,
    description: Preview.of(dialog.lastMessage),
    value: dialog,
  }));

  if (self.list.options.length) self.list.setSelectedIndex(0);
};
