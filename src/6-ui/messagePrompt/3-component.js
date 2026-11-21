const box = Box({
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  titleColor: config.theme.muted,
  flexShrink: 0,
  children: [self.quote, self.rule, self.input],
});

// The quote is ellipsized to the width, so a resize redraws it.
//box.onSizeChange = () => self.paintQuote();

box;
