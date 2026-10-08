// An ordered list with an index by key. Immutable: the only way to change it is to build a new
// one from the full ordered array, so the order and the index can never disagree.
({
  /**
   * @template T, K
   * @param {Iterable<T>} items
   * @param {(item: T) => K} keyOf
   * @returns {import('../../../types/collections').KeyedList<T, K>}
   */
  from: (items, keyOf) => {
    const list = Object.freeze([...items]);
    /** @type {Map<K, number>} */
    const index = new Map(list.map((item, position) => [keyOf(item), position]));
    if (index.size !== list.length) throw new Error('KeyedList.from: duplicate key');

    return Object.freeze({
      length: list.length,
      at: (position) => list[position] ?? null,
      get: (key) => {
        const position = index.get(key);
        return position === undefined ? null : list[position];
      },
      has: (key) => index.has(key),
      indexOf: (key) => index.get(key) ?? -1,
      [Symbol.iterator]: () => list[Symbol.iterator](),
    });
  },
});
