// Which of a command's bindings to show: the one a reader can type without reaching for a
// modifier, falling back to whatever came first when every binding needs one.
/** @type {typeof Binding.plainest} */
(bindings) =>
  bindings.find(({ sequence }) => sequence.every(({ stroke }) => !stroke.ctrl && !stroke.meta && !stroke.shift)) ??
  bindings[0];
