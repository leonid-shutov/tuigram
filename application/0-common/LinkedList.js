const createNode = (value, prev = null, next = null) => ({ value, prev, next });

const buildGetters = (list) => ({
  get head() {
    return list.head;
  },
  get tail() {
    return list.tail;
  },
  get size() {
    return list.size;
  },
});

const buildOperations = (list) => ({
  push: (value) => {
    const node = createNode(value, list.tail);
    if (list.tail !== null) list.tail.next = node;
    else list.head = node;
    list.tail = node;
    list.size++;
  },

  unshift: (value) => {
    const node = createNode(value, null, list.head);
    if (list.head) list.head.prev = node;
    else list.tail = node;
    list.head = node;
    list.size++;
  },

  pop: () => {
    if (list.tail === null) return null;
    const value = list.tail.value;
    list.tail = list.tail.prev;
    if (list.tail !== null) list.tail.next = null;
    else list.head = null;
    list.size--;
    return value;
  },

  shift: () => {
    if (list.head === null) return null;
    const value = list.head.value;
    list.head = list.head.next;
    if (list.head !== null) list.head.prev = null;
    else list.tail = null;
    list.size--;
    return value;
  },

  removeNode: (node) => {
    if (node.prev !== null) node.prev.next = node.next;
    else list.head = node.next;
    if (node.next !== null) node.next.prev = node.prev;
    else list.tail = node.prev;
    list.size--;
    return node.value;
  },
});

const buildIterator = (list) => () => {
  let current = list.head;
  return {
    next: () => {
      if (current === null) return { value: null, done: true };
      const value = current.value;
      current = current.next;
      return { value, done: false };
    },
  };
};

const from = (values = []) => {
  const list = { head: null, tail: null, size: 0 };

  const getters = buildGetters(list);
  const operations = buildOperations(list);
  const iterator = buildIterator(list);

  for (const value of values) operations.push(value);

  return {
    ...getters,
    ...operations,
    [Symbol.iterator]: iterator,
  };
};

({ from });
