// A new copy of the message the bubble draws: an edit, or a thumbnail that finished downloading.
/** @type {typeof Bubble.update} */
(view, message) => {
  view.message = message;
  Bubble.paint(view);
};
