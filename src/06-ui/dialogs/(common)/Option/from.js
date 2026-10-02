// An unmuted chat shows its unread count; a muted one, or one marked unread by hand with no count
// yet, shows only that something is unread, as a dot. 2-list.js repaints this in its own colour.
/** @param {{ unreadCount: number, isUnread: boolean, isMuted: boolean }} dialog */
const unreadMarker = ({ unreadCount, isUnread, isMuted }) => {
  const count = Dialog.unreadBadge(unreadCount);
  const dot = count !== null || isUnread ? '•' : '';
  const badge = count ?? dot;
  return isMuted ? dot : badge;
};

// A count stays right-aligned, flush with the row's edge; a muted chat's dot sits right after the
// name instead — it has no digits to line up, and muted rows are the quiet ones, so the dot reads
// better close to what it's marking than reaching for the far edge.
/** @param {{ name: string, width: number, marker: string, isMuted: boolean }} row */
const layoutName = ({ name, width, marker, isMuted }) => {
  if (marker === '') return Cells.clip(name, width);
  const room = width - marker.length - 1;
  const clippedName = isMuted ? Cells.clip(name, room) : Cells.fit(name, room);
  return `${clippedName} ${marker}`;
};

/** @type {typeof Option.from} */
({ chatId, name, lastMessage, unreadCount = 0, isUnread = false, isMuted = false }) => {
  // 3-component.js, minus borders and left/right gaps. Everything below is in cells, not UTF-16
  // units, so a wide emoji or CJK name neither runs into the gap nor ends a cell early.
  const width = screen.size.dialogsWidth - 4;
  // `mtcute`'s Dialog.isMuted can be null (unknown), which reads the same as false here.
  const muted = Boolean(isMuted);
  const gutter = config.dialogEmoji ? `${Emoji.fromHash(chatId)} ` : '';
  const indent = ' '.repeat(Cells.width(gutter));
  const nameWidth = width - indent.length;

  const marker = unreadMarker({ unreadCount, isUnread, isMuted: muted });
  const nameLine = layoutName({ name, width: nameWidth, marker, isMuted: muted });
  const preview = Message.preview(lastMessage);
  const description = preview === null ? '' : `${indent}${Cells.clip(preview, nameWidth)}`;

  return { chatId, name: `${gutter}${nameLine}`, description, marker, isMuted: muted };
};
