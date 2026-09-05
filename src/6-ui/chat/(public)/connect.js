// The two asynchronous capabilities the chat view needs from below, handed over once at
// startup by start.js. Injected rather than reached for, so the section stays unaware that
// a messenger exists.
/** @type {ChatSection['connect']} */
({ loadOlder, loadThumb }) => {
  self.loadOlder = loadOlder;
  self.loadThumb = loadThumb;
};
