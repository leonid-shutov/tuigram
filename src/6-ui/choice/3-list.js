const choiceList = Select({
  id: 'choiceList',
  options: [],
  marginX: 1,
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.bg,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.fg,
  showDescription: false,
  showScrollIndicator: false,
  showSelectionIndicator: true,
});

// An option's keys sit at the end of its row, dimmed, so the row still reads by its name first.
const KEYS_COLOR = tui.parseColor(config.theme.muted);
Select.paintMarker(choiceList, () => KEYS_COLOR);

choiceList;
