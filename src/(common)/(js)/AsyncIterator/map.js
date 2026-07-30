(() =>
  async function* (source, fn) {
    for await (const item of source) {
      yield await fn(item);
    }
  })();
