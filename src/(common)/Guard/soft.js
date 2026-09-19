/** @type {typeof Guard.soft} */
(fn, notice) =>
  (...args) => {
    const called = Result.from(() => fn(...args));
    if (!called.ok) {
      Crash.soft(called.error, notice);
      return null;
    }
    // An async handler returns a promise; its rejection is the same event.
    const { value } = called;
    if (isThenable(value)) return value.catch((error) => Crash.soft(error, notice));
    return value;
  };
