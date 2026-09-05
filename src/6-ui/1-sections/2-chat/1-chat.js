// The cursor is an index into the ScrollBox's own children, which are the bubbles in order —
// so moving it needs no message data, and the section stays unaware that a store exists. `bubbles` maps a
// message id to its bubble, which is all `confirm` needs.
//
// `loadOlder` and `loadThumb` are injected by 8-actions at startup (see connect). They are
// the only things the view needs from below; taking them as plain functions is what keeps
// `grep -r messenger src/6-ui` empty.
({
  bubbles: new Map(),
  selectedIndex: -1,
  loadOlder: async () => {},
  loadThumb: async () => null,
});
