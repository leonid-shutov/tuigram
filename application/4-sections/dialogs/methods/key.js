((handlers) => (ch) => {
  //console.dir({ ch });
  handlers[ch]();
})({
  j: () => module.next(),
  k: () => module.prev(),
  "\r": () => module.open(),
});
