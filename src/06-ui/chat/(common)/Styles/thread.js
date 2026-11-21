// Every message on the left, the way a forum thread reads: each run of posts under its sender's name
// and the time it started, ours under "You". Nothing frames a post but the edge that marks the
// cursor, a `▎` down its left that is transparent until the post is selected.
const EDGE = config.theme.borderChars ?? { ...tui.BorderChars[config.theme.borderStyle], vertical: '▎' };

/** @type {PostStyle} */
({
  gutter: 'left',
  gap: { apart: 1, run: 0 },
  frame: (message, body) => {
    const header = Post.header(Post.author(message), Day.time(message.date));
    const box = Post.box({
      border: ['left'],
      customBorderChars: EDGE,
      borderColor: 'transparent',
      alignSelf: 'flex-start',
      children: [header, ...body],
    });
    return { root: box, box, header };
  },
});
