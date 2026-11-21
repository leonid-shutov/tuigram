// Only a changed value is written: opentui's setters schedule a render whatever they are given, and
// most passes (any dialog changing, say) change nothing here.
/**
 * @template {object} T
 * @template {keyof T} K
 * @param {T} node @param {K} key @param {T[K]} value
 */
const set = (node, key, value) => {
  if (node[key] !== value) node[key] = value;
};

// What depends on the post's neighbours, so it is redone on every render: older history landing
// above can make the old head of the window continue the post before it, and the outbox-unread run
// grows and shrinks at the chat's end. The style says how much space a post keeps above it — none
// for the window's oldest, which has nothing above to keep apart from — and on which side the run's
// bar goes: on the right, beside the run's posts only; on the left, beside every post, so a post
// never shifts sideways as it joins or leaves the run. The gutter is the frame's, so the day
// separator and the divider over it still span the section. The header (a name over the post)
// shows only at the head of a run.
/** @type {typeof Post.place} */
(view, { first, continued, outboxUnread }) => {
  const { slot, root, header, style } = view;
  set(slot, 'marginTop', first ? 0 : style.gap[continued ? 'run' : 'apart']);
  set(root, 'marginLeft', style.gutter === 'left' ? Post.GUTTER : 0);
  set(root, 'marginRight', style.gutter === 'right' && outboxUnread ? Post.GUTTER : 0);
  if (header !== null) set(header, 'visible', !continued);
};
