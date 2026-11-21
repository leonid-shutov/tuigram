// A new copy of the message the post draws: an edit, or a thumbnail that finished downloading.
/** @type {typeof Post.update} */
(view, message) => {
  view.message = message;
  Post.paint(view);
};
