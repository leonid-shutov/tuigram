((handlers) => (ch) => {
  handlers[ch]();
})({
  j: () => module.next(),
  k: () => module.prev(),
});
