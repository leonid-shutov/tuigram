// Every message on the left, the way an IRC client logs it: the time and the sender's name in a
// column of their own, then a rule, then the text, wrapping under itself. Every post has its lead,
// and no space parts them, so the rule runs unbroken down the chat; it lights up beside the selected
// post.
const LEAD_NAME_CELLS = 10;

/** @param {string} name */
const column = (name) => {
  const clipped = Cells.clip(name, LEAD_NAME_CELLS);
  return `${' '.repeat(LEAD_NAME_CELLS - Cells.width(clipped))}${clipped}`;
};

/** @type {PostStyle} */
({
  gutter: 'left',
  gap: { apart: 0, run: 0 },
  frame: (message, body) => {
    const { name, color } = Post.author(message);
    const lead = Text({
      content: new tui.StyledText([
        tui.fg(config.theme.muted)(`${Day.time(message.date)} `),
        tui.fg(color)(tui.bold(column(name))),
        tui.fg(config.theme.muted)(' '),
      ]),
      flexShrink: 0,
      wrapMode: 'none',
    });
    const box = Post.box({ border: ['left'], borderColor: config.theme.muted, children: body });
    // The frame is the lead and the box side by side, as wide as the section so the box can wrap at
    // what's left of it after the lead. It yields to the slot's height cap like a box does, and the
    // box, stretched to its height, hands the cut on to the body.
    const root = Box({
      flexDirection: 'row',
      flexShrink: 1,
      overflow: 'hidden',
      children: [lead, box],
    });
    return { root, box, header: null };
  },
});
