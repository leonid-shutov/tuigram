export type LinkedListNode<T> = {
  value: T;
  prev: LinkedListNode<T> | null;
  next: LinkedListNode<T> | null;
};

export type LinkedList<T> = {
  readonly head: LinkedListNode<T> | null;
  readonly tail: LinkedListNode<T> | null;
  readonly size: number;
  push(value: T): void;
  unshift(value: T): void;
  pop(): T | null;
  shift(): T | null;
  find(predicate: (value: T) => boolean): T | null;
  findNode(predicate: (value: T) => boolean): LinkedListNode<T> | null;
  removeNode(node: LinkedListNode<T>): T;
  moveToFront(node: LinkedListNode<T>): T;
  [Symbol.iterator](): Iterator<T>;
};

/** An ordered list with an index by key, rebuilt rather than mutated — see KeyedList.js. */
export type KeyedList<T, K> = {
  readonly length: number;
  /** The item at `position`, or `null` past either end. */
  at(position: number): T | null;
  get(key: K): T | null;
  has(key: K): boolean;
  /** The item's position, or -1 when no item has `key`. */
  indexOf(key: K): number;
  [Symbol.iterator](): Iterator<T>;
};
