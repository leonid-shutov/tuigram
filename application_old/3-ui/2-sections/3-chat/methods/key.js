((handlers) => (ch) => {
  handlers[ch]();
})({
  j: () => $.down(),
  k: () => $.up(),
});
