Select({
  id: 'pickerList',
  flexGrow: 1,
  options: [],
  // See dialogs/2-list.js: an unset color prop falls back to a hardcoded dark-terminal one.
  backgroundColor: config.theme.bg,
  focusedBackgroundColor: config.theme.bg,
  textColor: config.theme.fg,
  focusedTextColor: config.theme.fg,
  descriptionColor: config.theme.muted,
  selectedBackgroundColor: config.theme.selection,
  selectedTextColor: config.theme.selectedText,
  selectedDescriptionColor: config.theme.selectedMuted,
  showDescription: true,
  showSelectionIndicator: true,
});
