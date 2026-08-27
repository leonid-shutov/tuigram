// @ts-check
(() =>
  /**
   * @template T
   * @param {AsyncIterable<T> | Iterable<T>} source
   * @param {number} n
   * @returns {AsyncGenerator<T>}
   */
  async function* (source, n) {
    if (n <= 0) return;
    let i = 0;
    for await (const item of source) {
      yield item;
      if (++i >= n) break;
    }
  })();
