// A line down the left edge of each message, ours still on the right, theirs on the left. A group
// member's name heads the first post of their run, and the posts of a run touch, so their lines join
// into one.
/** @type {PostStyle} */
({
  gutter: 'right',
  gap: { apart: 1, run: 0 },
  frame: (message, body) => {
    const { sender, isGroup } = message;
    const header = isGroup && !sender.isSelf ? Post.header(Post.author(message)) : null;
    const box = Post.box({
      border: ['left'],
      borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
      alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
      children: [header, ...body],
    });
    return { root: box, box, header };
  },
});
