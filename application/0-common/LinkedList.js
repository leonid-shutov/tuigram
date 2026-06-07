const createNode = (value, prev = null, next = null) => ({ value, prev, next });

({
  from: (values = []) => {
    const list = { head: null, tail: null, size: 0 };

    const push = (value) => {
      const node = createNode(value, list.tail);
      if (list.tail) list.tail.next = node;
      else list.head = node;
      list.tail = node;
      list.size++;
      return list;
    };

    const unshift = (value) => {
      const node = createNode(value, null, list.head);
      if (list.head) list.head.prev = node;
      else list.tail = node;
      list.head = node;
      list.size++;
      return list;
    };

    const pop = () => {
      if (!list.tail) return null;
      const val = list.tail.value;
      list.tail = list.tail.prev;
      if (list.tail) list.tail.next = null;
      else list.head = null;
      list.size--;
      return val;
    };

    const shift = () => {
      if (!list.head) return null;
      const val = list.head.value;
      list.head = list.head.next;
      if (list.head) list.head.prev = null;
      else list.tail = null;
      list.size--;
      return val;
    };

    const removeNode = (node) => {
      if (node.prev) node.prev.next = node.next;
      else list.head = node.next;
      if (node.next) node.next.prev = node.prev;
      else list.tail = node.prev;
      list.size--;
      return node.value;
    };

    const iterator = () => {
      let cur = list.head;
      return {
        next: () => {
          if (!cur) return { value: undefined, done: true };
          const value = cur.value;
          cur = cur.next;
          return { value, done: false };
        },
      };
    };

    for (const value of values) push(value);

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
      push,
      unshift,
      pop,
      shift,
      removeNode,
      [Symbol.iterator]: iterator,
    };
  },
});
