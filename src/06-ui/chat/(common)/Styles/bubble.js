// Each message in a bordered box: ours on the right, theirs on the left. A group member's name sits
// in the top border, on every post of a run since the border holds it for free, and the posts of a
// run touch.
/** @type {PostStyle} */
({
  gutter: 'right',
  gap: { apart: 1, run: 0 },
  frame: (message, body) => {
    const { sender, isGroup } = message;
    const author = isGroup && !sender.isSelf ? Post.author(message) : null;
    const box = Post.box({
      border: true,
      borderColor: sender.isSelf ? config.theme.selfBorder : config.theme.border,
      alignSelf: sender.isSelf ? 'flex-end' : 'flex-start',
      children: body,
      // eslint-disable-next-line no-extra-parens -- prettier insists on these parens
      ...(author && {
        title: ` ${author.name} `,
        titleAlignment: 'left',
        titleColor: author.color,
        minWidth: Cells.width(author.name) + 6,
      }),
    });
    return { root: box, box, header: null };
  },
});
