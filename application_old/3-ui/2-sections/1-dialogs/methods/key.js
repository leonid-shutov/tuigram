((handlers) => (ch) => {
  handlers[ch]();
})({
  j: () => $.next(),
  k: () => $.prev(),
  '\r': () => $.open(),
});
