// @ts-check
/**
 * @template T
 * @typedef {{ value: T, prev: Node<T> | null, next: Node<T> | null }} Node
 */

/**
 * @template T
 * @typedef {{ head: Node<T> | null, tail: Node<T> | null, size: number }} MutableList
 */

/**
 * @template T
 * @param {T} value
 * @param {Node<T> | null} [prev]
 * @param {Node<T> | null} [next]
 * @returns {Node<T>}
 */
const createNode = (value, prev = null, next = null) => ({ value, prev, next });

/**
 * @template T
 * @param {MutableList<T>} list
 */
const buildOperations = (list) => {
  /** @param {T} value */
  const push = (value) => {
    const node = createNode(value, list.tail);
    if (list.tail !== null) list.tail.next = node;
    else list.head = node;
    list.tail = node;
    list.size++;
  };

  /** @param {T} value */
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

  /** @param {(value: T) => boolean} predicate */
  const findNode = (predicate) => {
    for (let node = list.head; node !== null; node = node.next) if (predicate(node.value)) return node;
    return null;
  };

  /** @param {(value: T) => boolean} predicate */
  const find = (predicate) => findNode(predicate)?.value ?? null;

  /** @param {Node<T>} node */
  const removeNode = (node) => {
    if (node.prev !== null) node.prev.next = node.next;
    else list.head = node.next;
    if (node.next !== null) node.next.prev = node.prev;
    else list.tail = node.prev;
    list.size--;
    return node.value;
  };

  /** @param {Node<T>} node */
  const moveToFront = (node) => {
    removeNode(node);
    unshift(node.value);
    return node.value;
  };

  /**
   * @param {Node<T>} node
   * @param {number} within
   */
  const isNearHead = (node, within) => {
    /** @type {Node<T> | null} */
    let current = node;
    for (let i = 0; i < within; i++) {
      if (current === list.head) return true;
      if (current === null) return false;
      current = current.prev;
    }
    return false;
  };

  return { push, unshift, pop, shift, find, findNode, removeNode, moveToFront, isNearHead };
};

/**
 * @template T
 * @param {MutableList<T>} list
 */
const buildIterator = (list) => () => {
  let current = list.head;
  return {
    /** @returns {IteratorResult<T>} */
    next: () => {
      if (current === null) return { value: null, done: true };
      const value = current.value;
      current = current.next;
      return { value, done: false };
    },
  };
};

/**
 * @template T
 * @param {Iterable<T>} [values]
 * @returns {import('../../../types/collections').LinkedList<T>}
 */
const from = (values = []) => {
  /** @type {MutableList<T>} */
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
