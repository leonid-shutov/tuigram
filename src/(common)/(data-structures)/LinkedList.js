const createNode = (value, prev = null, next = null) => ({ value, prev, next });

const buildOperations = (list) => {
  const push = (value) => {
    const node = createNode(value, list.tail);
    if (list.tail !== null) list.tail.next = node;
    else list.head = node;
    list.tail = node;
    list.size++;
  };

  const unshift = (value) => {
    const node = createNode(value, null, list.head);
    if (list.head) list.head.prev = node;
    else list.tail = node;
    list.head = node;
    list.size++;
  };

  const pop = () => {
    if (list.tail === null) return null;
    const value = list.tail.value;
    list.tail = list.tail.prev;
    if (list.tail !== null) list.tail.next = null;
    else list.head = null;
    list.size--;
    return value;
  };

  const shift = () => {
    if (list.head === null) return null;
    const value = list.head.value;
    list.head = list.head.next;
    if (list.head !== null) list.head.prev = null;
    else list.tail = null;
    list.size--;
    return value;
  };

  const findNode = (predicate) => {
    for (let node = list.head; node !== null; node = node.next) if (predicate(node.value)) return node;
    return null;
  };

  const find = (predicate) => findNode(predicate)?.value ?? null;

  const removeNode = (node) => {
    if (node.prev !== null) node.prev.next = node.next;
    else list.head = node.next;
    if (node.next !== null) node.next.prev = node.prev;
    else list.tail = node.prev;
    list.size--;
    return node.value;
  };

  const moveToFront = (node) => {
    removeNode(node);
    unshift(node.value);
    return node.value;
  };

  const isNearHead = (node, within) => {
    for (let i = 0; i < within; i++) {
      if (node === list.head) return true;
      node = node.prev;
    }
    return false;
  };

  return { push, unshift, pop, shift, find, findNode, removeNode, moveToFront, isNearHead };
};

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

  const operations = buildOperations(list);
  const iterator = buildIterator(list);

  for (const value of values) operations.push(value);

  return {
    get head() {
      return list.head;
    },
    get tail() {
      return list.tail;
    },
    get size() {
      return list.size;
    },
    ...operations,
    [Symbol.iterator]: iterator,
  };
};

({ from });
