((handlers) => (ch) => {
  handlers[ch]();
})({
  j: () => module.navigator.next(),
  k: () => module.navigator.prev(),
  "\r": () => module.open(),
});
