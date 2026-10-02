/** @type {PickerSelf['filter']} */
(query) => {
  // A wrong-layout query ("ghbdtn" for "привет") still matches, a notch below a literal one.
  const SWAPPED_PENALTY = 5;
  const swapped = Layout.swap(query);
  const retyped = swapped !== query.toLowerCase();

  /** @param {string} name */
  const score = (name) => {
    const literal = Fuzzy.score(query, name);
    const other = retyped ? Fuzzy.score(swapped, name) : null;
    if (other === null) return literal;
    if (literal === null) return other - SWAPPED_PENALTY;
    return Math.max(literal, other - SWAPPED_PENALTY);
  };

  const matches = self.items
    .map((dialog) => ({ dialog, score: score(dialog.name) }))
    .filter((match) => match.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  self.list.options = matches.map(({ dialog }) => ({
    name: dialog.name,
    description: Message.preview(dialog.lastMessage) ?? '',
    value: dialog,
  }));

  if (self.list.options.length) self.list.setSelectedIndex(0);
};
