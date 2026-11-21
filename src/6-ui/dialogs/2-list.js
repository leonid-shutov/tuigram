const dialogsList = Select({
  id: 'dialogsList',
  height: '100%',
  options: [],
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.bg,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  descriptionColor: config.theme.muted,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.fg,
  selectedDescriptionColor: config.theme.muted,
  showSelectionIndicator: false,
});

// The unread marker at the end of a row needs its own colour: `unread` for an unmuted chat's
// count, or `muted` — same as the preview line below it — for a muted chat's dot, which needs no
// colour of its own to read as "unread". See Select.paintMarker for why this isn't a plain prop.
const UNREAD_COLOR = tui.parseColor(config.theme.unread);
const MUTED_UNREAD_COLOR = tui.parseColor(config.theme.muted);
Select.paintMarker(dialogsList, (/** @type {DialogOption} */ option) =>
  option.isMuted ? MUTED_UNREAD_COLOR : UNREAD_COLOR,
);

dialogsList;
