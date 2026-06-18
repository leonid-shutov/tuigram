(fn, ...args) => {
  try {
    const result = fn(...args);
    return [null, result];
  } catch (err) {
    return err;
  }
};
