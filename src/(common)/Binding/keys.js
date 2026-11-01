/** @type {typeof Binding.keys} */
(bindings) => {
  const binding = Binding.plainest(bindings);
  return binding === undefined ? '' : Binding.format(binding);
};
