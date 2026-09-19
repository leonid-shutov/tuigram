(() => {
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const extended = /** @type {typeof Result} */ (npm.metautil.Result);
  /**
   * @template T
   * @param {Promise<T>} promise
   * @returns {Promise<Result<T>>}
   */
  extended.fromPromise = (promise) =>
    promise.then(
      (value) => extended.ok(value),
      (error) => extended.fail(error),
    );
  return extended;
})();
