// @ts-check
(() =>
  /**
   * @template T
   * @template U
   * @param {AsyncIterable<T> | Iterable<T>} source
   * @param {(item: T) => U | Promise<U>} fn
   * @returns {AsyncGenerator<U>}
   */
  async function* (source, fn) {
    for await (const item of source) {
      yield await fn(item);
    }
  })();
