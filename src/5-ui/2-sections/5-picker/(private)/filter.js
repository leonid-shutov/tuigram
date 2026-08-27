(query) => {
  const matches = self.dialogs
    .map((dialog) => ({ dialog, score: Fuzzy.score(query, dialog.name) }))
    .filter((match) => match.score !== null)
    .sort((a, b) => b.score - a.score);

  self.list.options = matches.map(({ dialog }) => ({
    name: dialog.name,
    description: dialog.lastMessage ?? '',
    value: dialog,
  }));

  if (self.list.options.length) self.list.setSelectedIndex(0);
};
