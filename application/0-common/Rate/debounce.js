(fn, delay = 0) => {
  let timer = null;
  return (...args) => {
    node.timers.clearTimeout(timer);
    timer = node.timers.setTimeout(() => fn(...args), delay);
  };
};
