const BAR = '▎';

// Each line is ellipsized to `cells`, bar included, so a long quote never widens its box.
/** @type {typeof Quote.paint} */
({ color, head, body, italic }, cells) => {
  const room = Math.max(1, cells - Cells.width(BAR));
  const top = Cells.ellipsize(head, room);
  return new tui.StyledText([
    tui.fg(color)(BAR),
    italic ? tui.fg(color)(tui.italic(top)) : tui.fg(color)(tui.bold(top)),
    tui.fg(color)(`\n${BAR}`),
    tui.fg(config.theme.muted)(body === null ? '' : Cells.ellipsize(body, room)),
  ]);
};
