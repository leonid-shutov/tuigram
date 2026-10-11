// Two lines whatever state the reply is in, so resolving it never changes the height: unresolved
// it is `…` under `…`; with no one to name (a deleted original, a story) it is the one line it has
// over a bare bar.
/** @type {typeof Quote.from} */
({ sender, preview, deleted }) => {
  const { muted } = config.theme;
  if (sender === null && (deleted || preview !== null)) {
    return { color: muted, head: deleted ? 'Deleted message' : String(preview), body: null, italic: true };
  }
  return {
    color: sender === null ? muted : Sender.color(String(sender.id ?? sender.displayName)),
    head: sender?.displayName ?? '…',
    body: preview ?? (sender === null ? '…' : 'Message'),
    italic: false,
  };
};
