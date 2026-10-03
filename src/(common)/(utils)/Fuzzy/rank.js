// A wrong-layout query ("ghbdtn" for "привет") still matches, a notch below a literal one.
const SWAPPED_PENALTY = 5;

/** @type {typeof Fuzzy.rank} */
(query, items) => {
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

  return items
    .map((item) => ({ item, score: score(item.name) }))
    .filter((match) => match.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map(({ item }) => item);
};
