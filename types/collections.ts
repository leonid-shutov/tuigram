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
