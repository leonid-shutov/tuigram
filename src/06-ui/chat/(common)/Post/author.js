// Who wrote a message, as a header or a lead names them: "You" in our own border colour, anyone else
// by name in their sender colour.
const AUTHOR_CELLS = 24;

/** @type {typeof Post.author} */
({ sender }) =>
  sender.isSelf
    ? { name: Locale.t('You'), color: config.theme.selfBorder }
    : { name: Cells.clip(sender.displayName ?? '', AUTHOR_CELLS), color: Sender.color(String(sender.id)) };
