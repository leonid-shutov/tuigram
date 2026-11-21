// `bar`, with the line on each message's outer edge: down the left of theirs, down the right of ours,
// so it runs along the side of the chat each one sits on.
/** @type {PostStyle} */
({
  gutter: 'right',
  gap: { apart: 1, run: 0 },
  frame: (message, body) => {
    const { sender, isGroup } = message;
    const header = isGroup && !sender.isSelf ? Post.header(Post.author(message)) : null;
    const box = Post.box({
      border: [sender.isSelf ? 'right' : 'left'],
      borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
      alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
      children: [header, ...body],
    });
    return { root: box, box, header };
  },
});
